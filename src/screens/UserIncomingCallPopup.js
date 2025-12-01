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

export default function UserIncomingCallPopup({ navigation, route }) {
  const { booking, astrologerData, channelName } = route.params || {};

  const isVideo = booking?.mode === "video";
  const pulseAnim = useRef(new Animated.Value(0.9)).current;

  /* 🔔 Start Ringtone + Vibration */
  useEffect(() => {
    try {
      InCallManager.startRingtone("_DEFAULT_");
    } catch (e) {
      console.log("InCallManager ringtone error =>", e);
    }

    // Vibrate indefinitely with a pattern until cancelled
    // Vibration.vibrate([500, 500], true);

    return () => {
      try {
        InCallManager.stopRingtone();
      } catch (e) {
        console.log("InCallManager stopRingtone error =>", e);
      }
    //   Vibration.cancel();
    };
  }, []);

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
    } catch (e) {}
    // Vibration.cancel();

    navigation.replace("UserIncomingCallScreen", {
      booking,
      astrologerData,
      isVideo,
      channelName,
    });
  };

  /** ✖ Reject Call */
  const rejectCall = () => {
    try {
      InCallManager.stopRingtone();
    } catch (e) {}
    // Vibration.cancel();
    navigation.goBack();
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
          <Icon name="account" size={85} color="#fff" />
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
  avatarWrapper: {
    marginBottom: 30,
  },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#C9A961",
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
