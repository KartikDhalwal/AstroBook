import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  //   Vibration,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import InCallManager from "react-native-incall-manager";
import { Image } from "react-native";
import IMAGE_BASE_URL from "../imageConfig";
import axios from "axios";
import api from "../apiConfig";
import { initSocket, getSocket } from "../services/socket";

export default function UserIncomingCallPopup({ navigation, route }) {
  const isCleaningUp = useRef(false);
  const socketRef = useRef(null);

  const { booking, astrologerData, channelName } = route.params || {};
  const isVideo = booking?.consultationType === "videocall";

  const pulseAnim = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    const customerId = booking?.customer?._id;
    if (!customerId) return;

    const s = initSocket({
      userId: customerId,
      user_type: "customer",
    });

    socketRef.current = s;

    if (!s.connected) {
      s.connect();
    }

    return () => {
      socketRef.current = null;
    };
  }, [booking?.customer?._id]);
  const cleanupAndExit = () => {
    try {
      InCallManager.stopRingtone();
    } catch { }

    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };




  const endCallFromPopup = (reason = "rejected") => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;

    const socket = socketRef.current;

    if (socket) {
      const emitEnd = () => {
        socket.emit("call:ring:end", {
          channelName,
          bookingId: booking?._id,
          astrologerId: astrologerData?._id,
          customerId: booking?.customer?._id,
          endedBy: "customer",
          reason: "rejected",
        });

      };

      if (socket.connected) {
        emitEnd();
      } else {
        socket.once("connect", emitEnd);
      }
    }

    cleanupAndExit(); // ✅ ALWAYS runs
  };
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !channelName) return;

    socket.emit("call:join", {
      channelName,
      role: "customer",
      phase: "ringing",
    });
  }, [channelName]);


  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !channelName) return;

    const handleEnd = (data) => {
      if (data.channelName !== channelName) return;
      cleanupAndExit();
    };

    socket.on("call:end", handleEnd);
    socket.on("call:ring:end", handleEnd);

    return () => {
      socket.off("call:end", handleEnd);
      socket.off("call:ring:end", handleEnd);
    };
  }, [channelName]);




  /* 🔥 Pulse Animation */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  /** ✔ Accept Call */
  const acceptCall = () => {
    try {
      InCallManager.stopRingtone();
    } catch (e) { }
    // Vibration.cancel();

    navigation.replace("UserIncomingCallScreen", {
      booking,
      astrologerData,
      isVideo,
      channelName,
    });
  };
  const getImageUrl = (path) => {
    if (!path) return null;

    // If already a full URL
    if (path.startsWith('http')) {
      return `${path}?format=jpg`; // 👈 fixes RN no-extension issue
    }

    // Relative path from backend
    return `${IMAGE_BASE_URL}${path}?format=jpg`;
  };
  /** ✖ Reject Call */
  const rejectCall = () => {
    endCallFromPopup("rejected");
  };



  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatarWrapper,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.avatarCircle}>
          <Image
            source={{ uri: getImageUrl(astrologerData.image) }}
            style={styles.avatar}
          />
        </View>
      </Animated.View>

      <Text style={styles.nameText}>{astrologerData?.name || "Astrologer"}</Text>
      <Text style={styles.callTypeText}>
        {isVideo ? "Video Call" : "Voice Call"}
      </Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={rejectCall} style={styles.rejectBtn}>
          <Icon name="phone-hangup" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={acceptCall} style={styles.acceptBtn}>
          <Icon name={isVideo ? "video" : "phone"} size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },

  avatarWrapper: {
    marginBottom: 30,
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    // backgroundColor: "#C9A961",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
  },
  nameText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  callTypeText: {
    color: "#C9A961",
    fontSize: 18,
    marginTop: 5,
    letterSpacing: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 50,
    justifyContent: "space-between",
    width: "80%",
  },
  rejectBtn: {
    width: 80,
    height: 80,
    backgroundColor: "#E74C3C",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptBtn: {
    width: 80,
    height: 80,
    backgroundColor: "#4CAF50",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
