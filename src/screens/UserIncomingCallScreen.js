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
    Image,
    Dimensions,
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
import IMAGE_BASE_URL from "../imageConfig";
import { initSocket, getSocket } from "../services/socket";
const { width, height } = Dimensions.get("window");

let agoraEngine = null;

const UserIncomingCallScreen = ({ navigation, route }) => {
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(route?.params?.isVideo || false);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenInfo, setTokenInfo] = useState(null);
    const isCleaningUp = useRef(false);

    const [remainingTime, setRemainingTime] = useState(""); // ⬅ TIMER ADDED
    const endCallTriggered = useRef(false); // prevents duplicate end calls

    const tokenRefreshInProgress = useRef(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const channelName = route?.params?.channelName;
    const booking = route?.params?.booking;
    const astroLogerData = route?.params?.astrologerData;
    const customerId = booking?.customer?._id
    useEffect(() => {
        if (!customerId) return;

        const s = initSocket({
            userId: customerId,
            user_type: "customer",
        });

        if (!s.connected) {
            s.connect();
        }
    }, [customerId]);

    /* ---------------- PERMISSIONS ---------------- */
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        }
    };


    /* ---------------- INITIAL JOIN ---------------- */
    useEffect(() => {
        requestPermissions();
        initAndJoin();
        return () => { };
    }, []);

    /* ---------------- VOICE UI PULSE ---------------- */
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

    /* ----------------------------------------------------------
     ⏳ CALL END TIMER — Based on booking.time = "02:45 - 02:55"
    ----------------------------------------------------------- */
    useEffect(() => {
        if (!booking?.date || !booking?.fromTime || !booking?.toTime) return;

        const bookingDate = new Date(booking.date);
        const [endH, endM] = booking.toTime.split(":").map(Number);

        const callEnd = new Date(bookingDate);
        callEnd.setHours(endH, endM, 0, 0);

        const timer = setInterval(() => {
            const now = new Date();
            const diff = callEnd - now;

            if (diff <= 0) {
                requestEndCall("timer");
                clearInterval(timer);
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);

            setRemainingTime(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [booking?.date, booking?.fromTime, booking?.toTime]);

    const requestEndCall = async (reason) => {

        if (endCallTriggered.current) return;

        Promise.resolve().then(() => {
            if (!endCallTriggered.current) {
                endCall(reason);
            }
        });
        await axios.post(`${api}/mobile/call-end-logs`, {
            consultationId: booking?._id,
            endById: booking?.customer?._id,
            endedBy: 'customer',
            endTime: getISTDate()
        },
            { headers: { "Content-Type": "application/json" } }
        );
    };
    const getISTDate = () => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        return istTime.toISOString();
    };
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
            await agoraEngine.startPreview();
            await agoraEngine.enableAudio();

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    setIsJoined(true);

                    if (Platform.OS === "android") {
                        if (isVideoEnabled) {
                            agoraEngine.setEnableSpeakerphone(true);
                            setIsSpeakerOn(true);
                        } else {
                            agoraEngine.setEnableSpeakerphone(false);
                            setIsSpeakerOn(false);
                        }
                    }
                },


                onUserJoined: (connection, remoteUid) => {
                    setRemoteUid(remoteUid);
                },

                onUserOffline: () => {
                    if (!isCleaningUp.current) {
                        requestEndCall("agora-offline");
                    }
                },


                onTokenPrivilegeWillExpire: async () => {
                    await refreshToken();
                },
            });
            agoraEngine.setAudioProfile(
                0, // AudioProfileDefault
                1  // AudioScenarioCommunication  <-- THIS IS THE KEY
            );
            await agoraEngine.joinChannel(
                tokenRes.token,
                tokenRes.channelName,
                tokenRes.uid,
                {
                    channelProfile: ChannelProfileType.ChannelProfileCommunication,
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                }
            );
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    /* ---------------- TOKEN ---------------- */
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
        } catch (e) { }

        tokenRefreshInProgress.current = false;
    };

    const endCall = (reason) => {
        if (endCallTriggered.current) return;
        endCallTriggered.current = true;

        const socket = getSocket();

        // 🔴 CLEAN UP LOCALLY FIRST
        cleanupAndExit();
        console.log({
            channelName,
            bookingId: booking?._id,
            endedBy: "user",
            reason,
        })
        // 🔵 THEN NOTIFY SERVER (best-effort)
        if (socket && socket.connected) {
            socket.emit("call:end", {
                channelName,
                bookingId: booking?._id,
                endedBy: "user",
                reason,
            });
        }
    };

    const cleanupAndExit = () => {
        if (isCleaningUp.current) return;
        isCleaningUp.current = true;

        leaveChannel();

        navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
        });
    };

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onCallEnded = (data) => {
            if (data.channelName !== channelName) return;
            cleanupAndExit();
        };


        socket.on("call:end", onCallEnded);

        return () => {
            socket.off("call:end", onCallEnded);
        };
    }, [channelName]);




    const leaveChannel = () => {
        try {
            agoraEngine?.leaveChannel();
            agoraEngine?.release();
            agoraEngine = null;
        } catch (e) { }
    };

    /* ---------------- CONTROLS ---------------- */
    const toggleMute = () => {
        agoraEngine?.muteLocalAudioStream(!isMuted);
        setIsMuted(!isMuted);
    };

    const toggleSpeaker = async () => {
        if (!agoraEngine) return;

        const next = !isSpeakerOn;

        try {
            await agoraEngine.setEnableSpeakerphone(next);
            setIsSpeakerOn(next);
        } catch (e) {
            console.warn("Speaker toggle failed", e);
        }
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

    /* ---------------- LOADING ---------------- */
    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff" }}>Connecting…</Text>
            </View>
        );
    }
    const getImageUrl = (path) => {
        if (!path) return null;

        // If already a full URL
        if (path.startsWith('http')) {
            return `${path}?format=jpg`; // 👈 fixes RN no-extension issue
        }

        // Relative path from backend
        return `${IMAGE_BASE_URL}${path}?format=jpg`;
    };
    /* ---------------- UI ---------------- */
    return (
        <SafeAreaView style={styles.container}>
            {isVideoEnabled ? (
                <View style={{ flex: 1 }}>
                    {remoteUid ? (
                        <>
                            <RtcSurfaceView
                                style={styles.remoteVideo}
                                canvas={{
                                    uid: remoteUid,
                                    channelId: tokenInfo.channelName,
                                }}
                            />

                            <View style={styles.localVideoBox}>
                                <RtcSurfaceView
                                    style={styles.localVideo}
                                    canvas={{
                                        uid: 0,
                                        channelId: tokenInfo.channelName,
                                    }}
                                    setupMode={VideoViewSetupMode.VideoViewSetupReplace}
                                />
                            </View>
                        </>
                    ) : (
                        <View style={styles.waitScreen}>
                            <Icon name="account-circle-outline" size={90} color="#C9A961" />

                            <Text style={styles.waitTitle}>
                                Waiting for astrologer
                            </Text>

                            <Text style={styles.waitSubText}>
                                Please stay on the call, they will join shortly
                            </Text>
                        </View>

                    )}

                    {/* ⏳ TIMER ADDED HERE */}
                    <Text style={styles.timerText}>Ends In {remainingTime}</Text>

                    <View style={styles.controls}>
                        <TouchableOpacity onPress={toggleMute} style={styles.ctrlBtn}>
                            <Icon name={isMuted ? "microphone-off" : "microphone"} size={26} color="#fff" />
                        </TouchableOpacity>

                        {/* <TouchableOpacity onPress={toggleVideo} style={styles.ctrlBtn}>
                            <Icon name="video" size={26} color="#fff" />
                        </TouchableOpacity> */}

                        <TouchableOpacity onPress={() => requestEndCall("button")} style={styles.endBtn}>
                            <Icon name="phone-hangup" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleSpeaker} style={styles.ctrlBtn}>
                            <Icon name={isSpeakerOn ? "volume-high" : "volume-medium"} size={26} color="#fff" />
                        </TouchableOpacity>

                    </View>
                </View>
            ) : (
                <SafeAreaView style={styles.voiceContainer}>
                    <Text style={styles.userName}>{route?.params?.astrologerData?.name}</Text>

                    {/* TIMER IN VOICE UI */}
                    <Text style={styles.timerText}>Ends in {remainingTime}</Text>

                    <Text style={styles.statusText}>{remoteUid ? "Connected" : "Waiting…"}</Text>

                    <Animated.View style={[styles.avatarBox, { transform: [{ scale: pulseAnim }] }]}>
                        <Image
                            source={{ uri: getImageUrl(route?.params?.astrologerData.image) }}
                            style={styles.avatar}
                        />
                    </Animated.View>

                    <View style={styles.voiceControls}>
                        <TouchableOpacity onPress={toggleSpeaker} style={styles.roundBtn}>
                            <Icon
                                name={isSpeakerOn ? "volume-high" : "volume-medium"}
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleMute} style={styles.roundBtn}>
                            <Icon name={isMuted ? "microphone-off" : "microphone"} size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => requestEndCall("button")} style={styles.endBigBtn}>
                        <Icon name="phone-hangup" size={34} color="#fff" />
                    </TouchableOpacity>
                </SafeAreaView>
            )}
        </SafeAreaView>
    );
};

export default UserIncomingCallScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },

    remoteVideo: { width, height },

    localVideoBox: {
        position: "absolute",
        top: height * 0.08,
        right: width * 0.04,
        width: width * 0.28,
        height: height * 0.22,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#C9A961",
    },

    localVideo: { width: "100%", height: "100%" },

    timerText: {
        position: "absolute",
        top: height * 0.06,
        alignSelf: "center",
        color: "#fff",
        fontSize: width * 0.03,
        fontWeight: "500",
        backgroundColor: "rgba(0,0,0,0.45)",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
    },

    controls: {
        position: "absolute",
        bottom: height * 0.05,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        gap: width * 0.05,
    },
    waitScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        paddingHorizontal: width * 0.08,
    },

    waitTitle: {
        marginTop: height * 0.03,
        fontSize: width * 0.05,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },

    waitSubText: {
        marginTop: height * 0.015,
        fontSize: width * 0.035,
        color: "rgba(255,255,255,0.7)",
        textAlign: "center",
    },

    ctrlBtn: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: width * 0.075,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    endBtn: {
        width: width * 0.18,
        height: width * 0.18,
        borderRadius: width * 0.09,
        backgroundColor: "#E74C3C",
        justifyContent: "center",
        alignItems: "center",
    },

    voiceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
    },

    userName: {
        color: "#fff",
        fontSize: width * 0.065,
        fontWeight: "700",
    },

    avatarBox: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: width * 0.225,
        backgroundColor: "#C9A961",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: height * 0.04,
    },

    avatar: {
        width: width * 0.42,
        height: width * 0.42,
        borderRadius: width * 0.21,
    },

    voiceControls: {
        flexDirection: "row",
        gap: width * 0.08,
        marginTop: height * 0.02,
    },

    endBigBtn: {
        marginTop: height * 0.04,
        width: width * 0.22,
        height: width * 0.22,
        borderRadius: width * 0.11,
        backgroundColor: "#E74C3C",
        justifyContent: "center",
        alignItems: "center",
    },
});
