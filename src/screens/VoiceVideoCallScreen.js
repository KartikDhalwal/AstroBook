// VoiceVideoCallScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  VideoViewSetupMode,
  RtcSurfaceView,
} from 'react-native-agora';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Config from '../agoraconfig'; // keep appId here or override from server
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../apiConfig';

let agoraEngine;

export default function VoiceVideoCallScreen({ navigation, route }) {
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(route?.params?.isVideo || false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null); // { token, channelName, uid, expireAt }
  const [error, setError] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tokenRefreshInProgress = useRef(false);

  const astrologerData = route?.params?.astrologerData || {
    name: 'Pt. Rajesh Sharma',
    image: null,
  };

  const requestedChannel = route?.params?.channelName || null; // optional

  // Request mic + camera permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  useEffect(() => {
    requestPermissions();
    initAndJoin();

    return () => {
      leaveChannel();
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isJoined) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isJoined]);

  // Pulse animation for voice call
  useEffect(() => {
    if (!isVideoEnabled && isJoined) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isVideoEnabled, isJoined]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize engine and join channel after fetching token
  const initAndJoin = async () => {
    setIsLoading(true);
    try {
      const tokenResponse = await fetchTokenFromServer(requestedChannel);
      setTokenInfo(tokenResponse);

      // create engine
      agoraEngine = createAgoraRtcEngine();
      agoraEngine.initialize({ appId: Config.appId }); // or use tokenResponse.appId if server returns it

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          console.log('✅ Joined channel');
          setIsJoined(true);
        },
        onUserJoined: (uid) => {
          console.log('👤 Remote user joined', uid);
          setRemoteUid(uid);
        },
        onUserOffline: () => {
          console.log('❌ Remote user left');
          setRemoteUid(null);
        },
        onLeaveChannel: () => {
          setIsJoined(false);
          setRemoteUid(null);
        },
        // when token is about to expire, request new token from server and renew
        onTokenPrivilegeWillExpire: async () => {
          console.log('⚠️ Token will expire soon; refreshing token...');
          await refreshTokenAndRenew();
        },
      });

      if (isVideoEnabled) {
        await agoraEngine.enableVideo();
      }
      agoraEngine.enableAudio();

      // join with token from server
      await agoraEngine.joinChannel(
        tokenResponse.token,
        tokenResponse.channelName,
        0,
        {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        }
      );
    } catch (err) {
      console.error('initAndJoin error', err);
      setError(err.message || 'Failed to join call');
      Alert.alert('Call error', err.message || 'Failed to establish call');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch token from your backend
  const fetchTokenFromServer = async (channelNameProvided = null) => {
    // Replace with your server base URL
    const endpoint = `${api}/api/agora/token`;

    // Body: you can send channelName if you want server to use it
    const body = {
      channelName: channelNameProvided || undefined,
      // optionally user id: uid: 0,
    };

    const res = await axios.post(endpoint, body);
    // Expected server reply:
    // { token, channelName, uid, expireAt /* unix seconds */ }
    if (res?.data?.token == null) {
      throw new Error('Invalid token response from server');
    }
    return res.data;
  };

  // Refresh token and call engine.renewToken(token) if available
  const refreshTokenAndRenew = async () => {
    if (tokenRefreshInProgress.current) return;
    tokenRefreshInProgress.current = true;
    try {
      const newTokenInfo = await fetchTokenFromServer(tokenInfo?.channelName);
      setTokenInfo(newTokenInfo);
      if (agoraEngine && typeof agoraEngine.renewToken === 'function') {
        // SDK method to renew token
        agoraEngine.renewToken(newTokenInfo.token);
        console.log('🔁 Token renewed in SDK');
      } else {
        console.log('⚠️ renewToken not available — leaving and rejoining');
        // fallback: leave and rejoin with new token
        await leaveChannel();
        await initAndJoin();
      }
    } catch (err) {
      console.error('refreshTokenAndRenew error', err);
    } finally {
      tokenRefreshInProgress.current = false;
    }
  };

  const leaveChannel = async () => {
    if (agoraEngine) {
      try {
        await agoraEngine.leaveChannel();
      } catch (e) {
        console.warn('leaveChannel error', e);
      }
      try {
        agoraEngine.release();
      } catch (e) {
        // ignore
      }
      agoraEngine = null;
    }
  };

  const toggleMute = () => {
    if (!agoraEngine) return;
    agoraEngine.muteLocalAudioStream(!isMuted);
    setIsMuted(!isMuted);
  };

const toggleSpeaker = async () => {
  if (!agoraEngine) return;

  const enable = !isSpeakerOn;

  try {
    // Force route
    await agoraEngine.setEnableSpeakerphone(enable);

    // Extra safety: reset audio route
    if (Platform.OS === 'android') {
      agoraEngine.enableAudio();
    }

    setIsSpeakerOn(enable);
  } catch (err) {
    console.warn('Speaker toggle failed', err);
  }
};


  const toggleVideo = async () => {
    if (!agoraEngine) return;
    if (!isVideoEnabled) {
      await agoraEngine.enableVideo();
    } else {
      await agoraEngine.disableVideo();
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const endCall = async () => {
    await leaveChannel();
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Connecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isVideoEnabled ? 'light-content' : 'dark-content'}
        backgroundColor={isVideoEnabled ? '#1A1A1A' : '#FFFFFF'}
      />

      {isVideoEnabled ? (
        // Video Call UI
        <View style={styles.videoContainer}>
          {isJoined && remoteUid ? (
            <>
              <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.remoteVideo} />
              <View style={styles.videoTopBar}>
                <View style={styles.videoTopContent}>
                  <View style={styles.videoCallerInfo}>
                    <Text style={styles.videoCallerName}>{astrologerData.name}</Text>
                    <Text style={styles.videoDuration}>{formatDuration(callDuration)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.localVideoWrapper}>
                <RtcSurfaceView
                  canvas={{ uid: 0 }}
                  setupMode={VideoViewSetupMode.VideoViewSetupReplace}
                  style={styles.localVideo}
                />
              </View>
            </>
          ) : (
            <View style={styles.connectingContainer}>
              <View style={styles.videoAvatarPlaceholder}>
                <Icon name="account" size={80} color="#FFFFFF" />
              </View>
              <Text style={styles.connectingText}>{astrologerData.name}</Text>
              <Text style={styles.connectingSubtext}>{remoteUid ? 'Connecting...' : 'Calling...'}</Text>
            </View>
          )}

          <View style={styles.videoControls}>
            <TouchableOpacity onPress={toggleMute} style={[styles.videoControlBtn, isMuted && styles.videoActiveControl]}>
              <Icon name={isMuted ? 'microphone-off' : 'microphone'} size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleVideo} style={styles.videoControlBtn}>
              <Icon name="video" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleSpeaker} style={[styles.videoControlBtn, isSpeakerOn && styles.videoActiveControl]}>
              <Icon name={isSpeakerOn ? 'volume-high' : 'volume-medium'} size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={endCall} style={styles.videoEndCallBtn}>
              <Icon name="phone-hangup" size={30} color="#FFFFFF" />
            </TouchableOpacity>

          </View>
        </View>
      ) : (
        // Voice Call UI
        <SafeAreaView style={styles.voiceContainer}>
          <View style={styles.voiceHeader}>
            <TouchableOpacity onPress={endCall} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#2C1810" />
            </TouchableOpacity>
            <Text style={styles.voiceHeaderTitle}>VOICE CALL</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.callerInfo}>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.avatar}>
                <Icon name="account" size={70} color="#FFFFFF" />
              </View>
              <View style={styles.avatarRing} />
            </Animated.View>

            <Text style={styles.callerName}>{astrologerData.name}</Text>
            <Text style={styles.callStatus}>{isJoined ? formatDuration(callDuration) : 'Connecting...'}</Text>

            {isJoined && (
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            )}
          </View>

          <View style={styles.voiceControls}>
            <View style={styles.controlRow}>
              <View style={styles.controlItem}>
                <TouchableOpacity onPress={toggleSpeaker} style={[styles.roundControl, isSpeakerOn && styles.activeRoundControl]}>
                  <Icon name={isSpeakerOn ? 'volume-high' : 'volume-medium'} size={28} color={isSpeakerOn ? '#FFFFFF' : '#C9A961'} />
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Speaker</Text>
              </View>

              <View style={styles.controlItem}>
                <TouchableOpacity onPress={toggleVideo} style={styles.roundControl}>
                  <Icon name="video" size={28} color="#C9A961" />
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Video</Text>
              </View>

              <View style={styles.controlItem}>
                <TouchableOpacity onPress={toggleMute} style={[styles.roundControl, isMuted && styles.activeRoundControl]}>
                  <Icon name={isMuted ? 'microphone-off' : 'microphone'} size={28} color={isMuted ? '#FFFFFF' : '#C9A961'} />
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Mute</Text>
              </View>
            </View>

            <TouchableOpacity onPress={endCall} style={styles.voiceEndCallBtn}>
              <Icon name="phone-hangup" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

// ... keep the same styles from your original file (omitted here for brevity)
// Copy the styles object from your original component and paste below:
const styles = StyleSheet.create({
  /* (paste all styles from your original file here) */
  container: { 
    flex: 1, 
    backgroundColor: '#1A1A1A',
  },
  videoContainer: { flex: 1, backgroundColor: '#1A1A1A' },
  remoteVideo: { flex: 1, width: '100%', height: '100%' },
  videoTopBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  videoTopContent: { alignItems: 'center' },
  videoCallerInfo: { alignItems: 'center' },
  videoCallerName: { color: '#FFFFFF', fontSize: 20, fontWeight: '600', letterSpacing: 0.5 },
  videoDuration: { color: '#C9A961', fontSize: 14, marginTop: 4, letterSpacing: 1 },
  localVideoWrapper: { position: 'absolute', top: 120, right: 20, width: 100, height: 150, borderRadius: 4, overflow: 'hidden', borderWidth: 2, borderColor: '#C9A961', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  localVideo: { width: '100%', height: '100%' },
  connectingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  videoAvatarPlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#C9A961', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 3, borderColor: 'rgba(201, 169, 97, 0.3)' },
  connectingText: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginBottom: 8 },
  connectingSubtext: { color: '#C9A961', fontSize: 16, letterSpacing: 1 },
  videoControls: { position: 'absolute', bottom: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, paddingHorizontal: 20 },
  videoControlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  videoActiveControl: { backgroundColor: '#C9A961', borderColor: '#C9A961' },
  videoEndCallBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(231, 76, 60, 0.3)', shadowColor: '#E74C3C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 },
  voiceContainer: { flex: 1, backgroundColor: '#FAF8F5' },
  voiceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E4DC' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  voiceHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#C9A961', letterSpacing: 2 },
  callerInfo: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  avatarContainer: { marginBottom: 32, position: 'relative' },
  avatar: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#C9A961', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#C9A961', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 },
  avatarRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: 'rgba(201, 169, 97, 0.2)', top: -10, left: -10 },
  callerName: { fontSize: 26, fontWeight: '600', color: '#2C1810', marginBottom: 8, letterSpacing: 0.5 },
  callStatus: { fontSize: 16, color: '#8B7355', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16, borderWidth: 1, borderColor: '#4CAF50' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  statusText: { fontSize: 13, color: '#4CAF50', fontWeight: '600', letterSpacing: 0.5 },
  voiceControls: { paddingBottom: 50, paddingHorizontal: 20 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  controlItem: { alignItems: 'center' },
  roundControl: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 12, borderWidth: 1, borderColor: '#E8E4DC' },
  activeRoundControl: { backgroundColor: '#C9A961', borderColor: '#C9A961' },
  controlLabel: { fontSize: 13, color: '#8B7355', fontWeight: '500', letterSpacing: 0.5 },
  voiceEndCallBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', shadowColor: '#E74C3C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10, borderWidth: 3, borderColor: 'rgba(231, 76, 60, 0.3)' },
});
