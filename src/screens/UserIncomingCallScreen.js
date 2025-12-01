// UserIncomingCallScreen.js

import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    PermissionsAndroid,
    Platform,
    Animated,
    ActivityIndicator,
    Alert,
} from "react-native";
import axios from "axios";
import {
    createAgoraRtcEngine,
    ChannelProfileType,
    ClientRoleType,
    RtcSurfaceView,
    VideoViewSetupMode,
} from "react-native-agora";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Config from "../agoraconfig";
import api from "../apiConfig";

let agoraEngine = null;

const UserIncomingCallScreen = ({ navigation, route }) => {
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(route?.params?.isVideo || false);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenInfo, setTokenInfo] = useState(null);

    const tokenRefreshInProgress = useRef(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const channelName = route?.params?.channelName;

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        }
    };

    useEffect(() => {
        requestPermissions();
        initAndJoin();

        return () => leaveChannel();
    }, []);

    useEffect(() => {
        if (!isVideoEnabled) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 900, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [isVideoEnabled]);

    /* ---------------- INIT + JOIN ---------------- */
    const initAndJoin = async () => {
        try {
            if (!channelName) {
                Alert.alert("Error", "Channel name missing");
                return;
            }

            setIsLoading(true);

            const tokenRes = await fetchToken(channelName);
            setTokenInfo(tokenRes);

            agoraEngine = createAgoraRtcEngine();
            agoraEngine.initialize({ appId: Config.appId });

            await agoraEngine.enableVideo();
            await agoraEngine.startPreview();     // preview local cam
            await agoraEngine.enableAudio();

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: (connection, uid) => {
                    console.log("USER JOINED =>", uid);
                    setIsJoined(true);
                },

                onUserJoined: (connection, remoteUid) => {
                    console.log("REMOTE JOINED =>", remoteUid);
                    setRemoteUid(remoteUid);
                },

                onUserOffline: (connection, remoteUid) => {
                    console.log("REMOTE LEFT =>", remoteUid);
                    setRemoteUid(null);
                },

                onTokenPrivilegeWillExpire: async () => {
                    console.log("Token expiring…");
                    await refreshToken();
                },
            });

            await agoraEngine.joinChannel(
                tokenRes.token,
                tokenRes.channelName,
                tokenRes.uid, // USER UID = 2
                {
                    channelProfile: ChannelProfileType.ChannelProfileCommunication,
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                }
            );
        } catch (e) {
            console.log("Join error =>", e);
            Alert.alert("Error", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    /* ---------------- TOKEN API ---------------- */
    const fetchToken = async (chan) => {
        const res = await axios.post(
            `${api}/mobile/agora/token`,
            { channelName: chan, uid: 2 },
            { headers: { "Content-Type": "application/json" } }
        );
        return res.data;
    };

    const refreshToken = async () => {
        if (tokenRefreshInProgress.current) return;
        tokenRefreshInProgress.current = true;

        try {
            const newToken = await fetchToken(tokenInfo.channelName);
            setTokenInfo(newToken);
            agoraEngine?.renewToken(newToken.token);
        } catch (e) {
            console.log("Token refresh error =>", e);
        }

        tokenRefreshInProgress.current = false;
    };

    /* ---------------- LEAVE ---------------- */
    const leaveChannel = () => {
        try {
            agoraEngine?.leaveChannel();
            agoraEngine?.release();
            agoraEngine = null;
        } catch (e) {}
    };

    /* ---------------- CONTROLS ---------------- */
    const toggleMute = () => {
        agoraEngine?.muteLocalAudioStream(!isMuted);
        setIsMuted(!isMuted);
    };

    const toggleSpeaker = () => {
        agoraEngine?.setEnableSpeakerphone(!isSpeakerOn);
        setIsSpeakerOn(!isSpeakerOn);
    };

    const toggleVideo = async () => {
        if (!isVideoEnabled) {
            await agoraEngine.enableVideo();
            await agoraEngine.startPreview();
            setIsVideoEnabled(true);
        } else {
            await agoraEngine.disableVideo();
            setIsVideoEnabled(false);
        }
    };

    const endCall = () => {
        leaveChannel();
        navigation.goBack();
    };

    /* ---------------- LOADING ---------------- */
    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff" }}>Connecting…</Text>
            </View>
        );
    }

    /* ---------------- UI ---------------- */
    return (
        <View style={styles.container}>
            {isVideoEnabled ? (
                <View style={{ flex: 1 }}>
                    {remoteUid ? (
                        <>
                            {/* REMOTE VIDEO */}
                            <RtcSurfaceView
                                style={styles.remoteVideo}
                                canvas={{
                                    uid: remoteUid,
                                    channelId: tokenInfo.channelName,
                                }}
                            />

                            {/* LOCAL VIDEO */}
                            <View style={styles.localVideoBox}>
                                <RtcSurfaceView
                                    style={styles.localVideo}
                                    canvas={{
                                        uid: 0,  // ALWAYS 0 FOR LOCAL
                                        channelId: tokenInfo.channelName,
                                    }}
                                    setupMode={VideoViewSetupMode.VideoViewSetupReplace}
                                />
                            </View>
                        </>
                    ) : (
                        <View style={styles.waitScreen}>
                            <Icon name="account" size={80} color="#fff" />
                            <Text style={{ color: "#fff" }}>Waiting for astrologer…</Text>
                        </View>
                    )}

                    {/* CONTROLS */}
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={toggleMute} style={styles.ctrlBtn}>
                            <Icon name={isMuted ? "microphone-off" : "microphone"} size={26} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleVideo} style={styles.ctrlBtn}>
                            <Icon name="video" size={26} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleSpeaker} style={styles.ctrlBtn}>
                            <Icon name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={endCall} style={styles.endBtn}>
                            <Icon name="phone-hangup" size={30} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <SafeAreaView style={styles.voiceContainer}>
                    <Text style={styles.userName}>{route?.params?.astrologerData?.name}</Text>
                    <Text style={styles.statusText}>{remoteUid ? "Connected" : "Waiting…"}</Text>

                    <Animated.View style={[styles.avatarBox, { transform: [{ scale: pulseAnim }] }]}>
                        <Icon name="account" size={90} color="#fff" />
                    </Animated.View>

                    <View style={styles.voiceControls}>
                        <TouchableOpacity onPress={toggleSpeaker} style={styles.roundBtn}>
                            <Icon name="volume-high" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleVideo} style={styles.roundBtn}>
                            <Icon name="video" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleMute} style={styles.roundBtn}>
                            <Icon name={isMuted ? "microphone-off" : "microphone"} size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={endCall} style={styles.endBigBtn}>
                        <Icon name="phone-hangup" size={34} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>
            )}
        </View>
    );
};

export default UserIncomingCallScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },

    remoteVideo: { width: '100%', height: '100%' },

    localVideoBox: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 100,
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#C9A961',
    },
    localVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },

    waitScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    ctrlBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E74C3C',
        justifyContent: 'center',
        alignItems: 'center',
    },

    voiceContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
    userName: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 10 },
    statusText: { color: '#aaa', fontSize: 16 },

    avatarBox: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#C9A961',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
    },

    voiceControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginVertical: 20,
    },
    roundBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    endBigBtn: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E74C3C',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
});
