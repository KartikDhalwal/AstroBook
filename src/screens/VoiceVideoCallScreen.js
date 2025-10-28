import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  VideoViewSetupMode,
  RtcSurfaceView,
} from 'react-native-agora';
import Config from '../agoraconfig';
import { SafeAreaView } from 'react-native-safe-area-context';

let agoraEngine;

export default function VoiceVideoCallScreen({ navigation }) {
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0];

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
    setupAgora();

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
            toValue: 1.2,
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

  const setupAgora = async () => {
    agoraEngine = createAgoraRtcEngine();
    agoraEngine.initialize({
      appId: Config.appId,
    });

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
    });

    agoraEngine.enableAudio();
    await agoraEngine.joinChannel(
      Config.token,
      Config.channelName,
      0,
      {
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      }
    );
  };

  const leaveChannel = async () => {
    if (agoraEngine) {
      await agoraEngine.leaveChannel();
      agoraEngine.release();
    }
  };

  const toggleMute = () => {
    if (!agoraEngine) return;
    agoraEngine.muteLocalAudioStream(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    if (!agoraEngine) return;
    agoraEngine.setEnableSpeakerphone(!isSpeakerOn);
    setIsSpeakerOn(!isSpeakerOn);
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

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isVideoEnabled ? "light-content" : "dark-content"}
        backgroundColor={isVideoEnabled ? "#000" : "#FFF8E7"}
      />
      
      {isVideoEnabled ? (
        // Video Call UI
        <View style={styles.videoContainer}>
          {isJoined && remoteUid ? (
            <>
              {/* Remote Video - Full Screen */}
              <RtcSurfaceView
                canvas={{ uid: remoteUid }}
                style={styles.remoteVideo}
              />

              {/* Top Info Bar */}
              <View style={styles.videoTopBar}>
                <Text style={styles.videoCallerName}>Contact Name</Text>
                <Text style={styles.videoDuration}>{formatDuration(callDuration)}</Text>
              </View>

              {/* Local Video - Small Overlay */}
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
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <Text style={styles.connectingText}>
                {remoteUid ? 'Connecting...' : 'Calling...'}
              </Text>
            </View>
          )}

          {/* Video Controls */}
          <View style={styles.videoControls}>
            <TouchableOpacity 
              onPress={toggleMute} 
              style={[styles.videoControlBtn, isMuted && styles.activeControl]}
            >
              <Text style={styles.videoControlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleVideo} 
              style={styles.videoControlBtn}
            >
              <Text style={styles.videoControlIcon}>📹</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleSpeaker} 
              style={[styles.videoControlBtn, isSpeakerOn && styles.activeControl]}
            >
              <Text style={styles.videoControlIcon}>{isSpeakerOn ? '🔊' : '🔈'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={endCall} 
              style={styles.endCallBtn}
            >
              <Text style={styles.endCallIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Voice Call UI
        <SafeAreaView style={styles.voiceContainer}>
          {/* Header */}
          <View style={styles.voiceHeader}>
            <TouchableOpacity onPress={endCall} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <Animated.View 
              style={[
                styles.avatarContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
            </Animated.View>

            <Text style={styles.callerName}>Contact Name</Text>
            <Text style={styles.callStatus}>
              {isJoined ? formatDuration(callDuration) : 'Calling...'}
            </Text>
          </View>

          {/* Voice Controls */}
          <View style={styles.voiceControls}>
            <View style={styles.controlRow}>
              <View style={styles.controlItem}>
                <TouchableOpacity 
                  onPress={toggleSpeaker}
                  style={[styles.roundControl, isSpeakerOn && styles.activeRoundControl]}
                >
                  <Text style={styles.controlEmoji}>{isSpeakerOn ? '🔊' : '🔈'}</Text>
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Speaker</Text>
              </View>

              <View style={styles.controlItem}>
                <TouchableOpacity 
                  onPress={toggleVideo}
                  style={styles.roundControl}
                >
                  <Text style={styles.controlEmoji}>📹</Text>
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Video</Text>
              </View>

              <View style={styles.controlItem}>
                <TouchableOpacity 
                  onPress={toggleMute}
                  style={[styles.roundControl, isMuted && styles.activeRoundControl]}
                >
                  <Text style={styles.controlEmoji}>{isMuted ? '🔇' : '🎤'}</Text>
                </TouchableOpacity>
                <Text style={styles.controlLabel}>Mute</Text>
              </View>
            </View>

            {/* End Call Button */}
            <TouchableOpacity 
              onPress={endCall}
              style={styles.voiceEndCallBtn}
            >
              <Text style={styles.voiceEndCallIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },

  // Video Call Styles
  videoContainer: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  remoteVideo: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  videoCallerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  videoDuration: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
  },
  localVideoWrapper: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFAE42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 60,
  },
  connectingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  videoControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  videoControlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  activeControl: {
    backgroundColor: '#FFAE42',
  },
  videoControlIcon: {
    fontSize: 24,
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  endCallIcon: {
    fontSize: 28,
  },

  // Voice Call Styles
  voiceContainer: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  voiceHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#333',
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFAE42',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFAE42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarIcon: {
    fontSize: 70,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#666',
  },
  voiceControls: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlItem: {
    alignItems: 'center',
  },
  roundControl: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  activeRoundControl: {
    backgroundColor: '#FFAE42',
  },
  controlEmoji: {
    fontSize: 26,
  },
  controlLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  voiceEndCallBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    transform: [{ rotate: '135deg' }],
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceEndCallIcon: {
    fontSize: 32,
  },
});