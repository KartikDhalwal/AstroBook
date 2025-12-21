import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
  Animated,
  Keyboard,
  SafeAreaView,
  ImageBackground,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { initSocket, getSocket } from "../services/socket";


import api from "../apiConfig";
import IMAGE_BASE_URL from "../imageConfig";

const CHAT_HISTORY_PATH = `${api}/mobile/chat`;

// Get dynamic dimensions
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Responsive sizing helpers
const scale = (size) => (WINDOW_WIDTH / 375) * size; // Base width 375 (iPhone X)
const verticalScale = (size) => (WINDOW_HEIGHT / 812) * size; // Base height 812 (iPhone X)
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export default function ChatScreen({ route }) {
  const { astrologer: routeAstrologer, userData: routeUser, time: timeString, date: bookingDate } = route?.params || {};
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);

  const userData = routeUser || {
    _id: "user_123",
    customerName: "User",
    image: null,
    status: "online",
  };

  const parseBookingDate = (dateStr) => {
    if (!dateStr) return null;

    // Try native Date parsing first (for "Wed Dec 17 2025")
    const native = new Date(dateStr);
    if (!isNaN(native.getTime())) {
      native.setHours(0, 0, 0, 0);
      return native;
    }

    // Fallback: "17 Dec 2025"
    const parts = dateStr.replace(/\s+/g, " ").trim().split(" ");
    if (parts.length !== 3) return null;

    const [day, monthStr, year] = parts;

    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3,
      May: 4, Jun: 5, Jul: 6, Aug: 7,
      Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const month = months[monthStr];
    if (month === undefined) return null;

    const d = new Date(Number(year), month, Number(day));
    d.setHours(0, 0, 0, 0);
    return d;
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
  const astrologer = routeAstrologer || { _id: "", astrologerName: "Astrologer", image: null, status: "online" };
  const astrologerImg = getImageUrl(astrologer.profileImage);

  const checkTimeValidity = (slot, dateStr) => {
    console.log({ slot, dateStr })
    if (!slot || !dateStr) return false;
    const bookingDay = parseBookingDate(dateStr);
    if (!bookingDay || isNaN(bookingDay.getTime())) return false;
    const now = new Date();
    if (
      now.getFullYear() !== bookingDay.getFullYear() ||
      now.getMonth() !== bookingDay.getMonth() ||
      now.getDate() !== bookingDay.getDate()
    ) {
      return false;
    }
    const [start, end] = slot.split(" - ");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startTime = new Date(bookingDay);
    startTime.setHours(sh, sm, 0, 0);
    const endTime = new Date(bookingDay);
    endTime.setHours(eh, em, 0, 0);
    return now >= startTime && now <= endTime;
  };

useEffect(() => {
  const validate = () => {
    const result = checkTimeValidity(timeString, bookingDate);

    // Session JUST ended
    if (isWithinTime && !result && !sessionEnded) {
      setSessionEnded(true);
      setIsWithinTime(false);

      Keyboard.dismiss();

      Alert.alert(
        "Session Ended",
        "Your consultation session has been ended.",
        [{ text: "OK", style: "default" }],
        { cancelable: false }
      );
    }

    setIsWithinTime(result);
  };

  validate();
  const interval = setInterval(validate, 30000); // check every 30 sec
  return () => clearInterval(interval);
}, [timeString, bookingDate, isWithinTime, sessionEnded]);

  const userId = userData._id;
  const astrologerId = astrologer._id;

  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDotAnim = useRef(new Animated.Value(0)).current;

  // Enhanced keyboard handling


  useEffect(() => {
    if (otherTyping) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      typingDotAnim.setValue(0);
    }
  }, [otherTyping, typingDotAnim]);

  useEffect(() => {
    loadChatHistory();
    initializeSocket();

    return () => {
      const s = getSocket();
      if (!s) return;

      s.off("receive_message_normal", onReceiveMessage);
      s.off("typing");
      s.off("stopped_typing");
      s.off("message_delivered_normal");
      s.off("message_read_normal");
    };

  }, []);

  const loadChatHistory = async () => {
    try {
      if (!astrologerId || !userId) {
        setLoadingHistory(false);
        return;
      }
      const url = `${CHAT_HISTORY_PATH}/${userId}/${astrologerId}`;
      console.log(url)
      const res = await axios.get(url, { headers: { "Content-Type": "application/json" } });
      const data = res.data;
      if (data && data.success) {
        const formatted = (data.messages || []).map((m) => ({
          id: m.messageId || m._id || `${Date.now()}_${Math.random()}`,
          text: m.text || m.message || "",
          senderId: m.senderId,
          receiverId: m.receiverId,
          timestamp: m.timestamp || m.createdAt,
          status: m.status || "delivered",
        }));
        setMessages(formatted);
        setTimeout(scrollToBottom, 120);
      }
    } catch (err) {
      console.error("Chat history error:", err?.response?.data ?? err?.message ?? err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const initializeSocket = () => {
    if (!userId || !astrologerId) return;

    const s = initSocket({
      userId,
      user_type: "customer",
    });

    if (!s.connected) {
      s.connect();
    }

    socketRef.current = s;

    s.emit("join_normal_chat", { userId, astrologerId });

    s.on("receive_message_normal", onReceiveMessage);

    s.on("typing", (data) => {
      if (data.userId === astrologerId) setOtherTyping(true);
    });

    s.on("stopped_typing", (data) => {
      if (data.userId === astrologerId) setOtherTyping(false);
    });

    s.on("message_delivered_normal", ({ tempId, messageId }) => {
      if (!tempId || !messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, id: messageId, status: "delivered" } : m
        )
      );
    });

    s.on("message_read_normal", ({ messageId }) => {
      updateMessageStatus(messageId, "read");
    });
  };


  const onReceiveMessage = (message) => {
    const formatted = {
      id: message.messageId || message.id || `${Date.now()}_${Math.random()}`,
      text: message.text || message.message || "",
      senderId: message.senderId,
      receiverId: message.receiverId,
      timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
      status: message.status || "delivered",
      tempId: message.tempId,
    };

    setMessages((prev) => {
      if (formatted.tempId) {
        const exists = prev.some((m) => m.id === formatted.tempId);
        if (exists) {
          return prev.map((m) =>
            m.id === formatted.tempId ? { ...m, id: formatted.id, status: formatted.status, timestamp: formatted.timestamp } : m
          );
        }
      }

      if (prev.some((m) => m.id === formatted.id)) return prev;

      const fuzzy = prev.some(
        (m) =>
          m.text === formatted.text &&
          m.senderId === formatted.senderId &&
          Math.abs(new Date(m.timestamp) - new Date(formatted.timestamp)) < 1500
      );
      if (fuzzy) return prev;

      return [...prev, formatted];
    });

    setOtherTyping(false);
    setTimeout(scrollToBottom, 80);

    if (formatted.senderId === astrologerId && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("read_message_normal", { messageId: formatted.id, userId });
    }
  };

  const updateMessageStatus = (messageId, status) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)));
  };

  const handleSendMessage = () => {
  if (!isWithinTime || sessionEnded) return;

  const trimmed = inputText.trim();
  if (!trimmed) return;

    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payload = {
      tempId,
      text: trimmed,
      senderId: userId,
      receiverId: astrologerId,
      timestamp: new Date().toISOString(),
    };

    const local = { ...payload, id: tempId, status: "sent" };
    setMessages((prev) => [...prev, local]);
    setInputText("");
    setIsTyping(false);
    setTimeout(scrollToBottom, 80);

    const s = getSocket();
    if (s && s.connected) {
      s.emit("send_message_normal", payload);
      s.emit("stopped_typing", { userId, astrologerId });
    }

  };

  const handleTyping = (text) => {
    setInputText(text);

    const s = getSocket();
    if (s && s.connected) {
      s.emit("typing", { userId, astrologerId });
    }


    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("stopped_typing", { userId, astrologerId });
      }
      setIsTyping(false);
    }, 1500);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current?.scrollToEnd) {
        flatListRef.current.scrollToEnd({ animated: true });
      } else if (flatListRef.current?.scrollToOffset) {
        flatListRef.current.scrollToOffset({ offset: 99999, animated: true });
      }
    }, 100);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    m = m < 10 ? `0${m}` : m;
    return `${h}:${m} ${ampm}`;
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case "sent":
        return <Icon name="check" size={moderateScale(14)} color="rgba(255,255,255,0.8)" />;
      case "delivered":
        return <Icon name="check-all" size={moderateScale(14)} color="rgba(255,255,255,0.8)" />;
      case "read":
        return <Icon name="check-all" size={moderateScale(14)} color="#FCD34D" />;
      default:
        return <Icon name="clock-outline" size={moderateScale(14)} color="rgba(255,255,255,0.6)" />;
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.senderId === userId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;

    return (
      <View style={[styles.messageContainer, isMine ? styles.myMessageContainer : styles.theirMessageContainer]}>
        {!isMine && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              astrologerImg ? (
                <Image source={{ uri: astrologerImg }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{(astrologer.astrologerName || "A")[0].toUpperCase()}</Text>
                </View>
              )
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.messageBubble, isMine ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
          <View style={styles.footerRow}>
            <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>{formatTime(item.timestamp)}</Text>
            {isMine && <View style={styles.statusIcon}>{renderMessageStatus(item.status)}</View>}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherTyping) return null;
    const dot1 = typingDotAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
    const dot2 = typingDotAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, 0] });
    const dot3 = typingDotAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

    return (
      <View style={styles.typingContainer}>
        <View style={styles.avatarContainer}>
          {astrologerImg ? (
            <Image source={{ uri: astrologerImg }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{(astrologer.astrologerName || astrologer.name || "A")[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatarContainer}>
            {astrologerImg ? (
              <Image source={{ uri: astrologerImg }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.headerAvatarText}>{(astrologer.astrologerName || "A")[0].toUpperCase()}</Text>
              </View>
            )}
            {astrologer.status === "online" && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{astrologer.astrologerName || routeAstrologer.name || "Astrologer"}</Text>
            {/* <View style={styles.statusRow}>
              <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
              <Text style={styles.headerStatus}>{otherTyping ? "typing..." : astrologer.status === "online" ? "Active now" : "Offline"}</Text>
            </View> */}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#db9a4a" />
        <Image
          source={require('../assets/images/logoBlack.png')}
          style={styles.watermarkImage}
        />
        {renderHeader()}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 70}
        >
          {/* <View style={styles.messagesContainer}> */}
          <ImageBackground
            source={require("../assets/images/logoBlack.png")}
            style={styles.messagesContainer}
            imageStyle={styles.watermark}
          >
            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#db9a4a" />
                <Text style={styles.loadingText}>Loading conversation...</Text>
              </View>
            ) : (
              <FlatList
                data={messages}
                ref={flatListRef}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                ListFooterComponent={renderTypingIndicator}
                onContentSizeChange={scrollToBottom}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </ImageBackground>

          <View style={styles.inputContainer}>
            <View style={styles.inputShadow}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                     placeholder={
    sessionEnded
      ? "Your session has ended"
      : isWithinTime
      ? "Type your message..."
      : "Chat will be enabled in your session"
  }
                    placeholderTextColor="#9CA3AF"
                    value={inputText}
  onChangeText={isWithinTime && !sessionEnded ? handleTyping : undefined}
  editable={isWithinTime && !sessionEnded}
                    multiline
                    scrollEnabled
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                </View>
                <TouchableOpacity
  style={[
    styles.sendButton,
    (!inputText.trim() || !isWithinTime || sessionEnded) &&
      styles.sendButtonDisabled
  ]}
  onPress={handleSendMessage}
  disabled={!inputText.trim() || !isWithinTime || sessionEnded}
>

                  <Icon name="send" size={moderateScale(20)} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#db9a4a",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
  watermarkImage: {
    position: 'absolute',
    opacity: 0.05,
    width: WINDOW_WIDTH * 1.5,
    height: WINDOW_HEIGHT * 0.7,
    resizeMode: 'contain',
    top: WINDOW_HEIGHT * 0.1,
    left: -WINDOW_WIDTH * 0.25,
    zIndex: -1,
  },
  header: {
    backgroundColor: "#db9a4a",
    paddingTop: Platform.OS === "ios" ? 0 : verticalScale(15),
    paddingBottom: verticalScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: scale(16)
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerAvatarContainer: {
    position: "relative"
  },
  headerAvatar: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)"
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: "#4ADE80",
    borderWidth: 3,
    borderColor: "#db9a4a"
  },
  headerInfo: {
    marginLeft: scale(14),
    flex: 1
  },
  headerName: {
    fontSize: moderateScale(19),
    fontWeight: "700",
    color: "#fff",
    marginBottom: verticalScale(3),
    letterSpacing: 0.3
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  statusDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    marginRight: scale(6)
  },
  statusConnected: {
    backgroundColor: "#4ADE80"
  },
  statusDisconnected: {
    backgroundColor: "#9CA3AF"
  },
  headerStatus: {
    fontSize: moderateScale(13),
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500"
  },
  headerAvatarText: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#fff"
  },

  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1
  },
  watermark: { opacity: 0.06, resizeMode: "fill" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: verticalScale(60)
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(15),
    color: "#6B7280",
    fontWeight: "500"
  },
  messagesList: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },

  messageContainer: {
    marginBottom: verticalScale(10),
    flexDirection: "row",
    alignItems: "flex-end"
  },
  myMessageContainer: {
    justifyContent: "flex-end",
    alignSelf: "flex-end"
  },
  theirMessageContainer: {
    justifyContent: "flex-start",
    alignSelf: "flex-start"
  },

  avatarContainer: {
    width: moderateScale(36),
    marginRight: scale(8),
    marginBottom: verticalScale(2)
  },
  avatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    borderWidth: 2,
    borderColor: "#E5E7EB"
  },
  avatarPlaceholder: {
    backgroundColor: "#db9a4a",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#c28940"
  },
  avatarText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#fff"
  },
  avatarSpacer: {
    width: moderateScale(36),
    height: moderateScale(36)
  },

  messageBubble: {
    maxWidth: WINDOW_WIDTH * 0.72,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(18),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  myMessageBubble: {
    backgroundColor: "#db9a4a",
    borderBottomRightRadius: moderateScale(4)
  },
  theirMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },

  messageText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(21),
    letterSpacing: 0.2
  },
  myMessageText: {
    color: "#fff"
  },
  theirMessageText: {
    color: "#1F2937"
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(5)
  },
  messageTime: {
    fontSize: moderateScale(11),
    fontWeight: "500"
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.75)"
  },
  theirMessageTime: {
    color: "#9CA3AF"
  },
  statusIcon: {
    marginLeft: scale(5)
  },

  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: verticalScale(4),
    marginBottom: verticalScale(8)
  },
  typingBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(18),
    borderBottomLeftRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6)
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    backgroundColor: "#db9a4a",
    borderRadius: moderateScale(4)
  },

  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(8),
    paddingBottom: Platform.OS === "ios" ? verticalScale(8) : verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB"
  },
  inputShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F9FAFB",
    borderRadius: moderateScale(26),
    paddingLeft: scale(4),
    paddingRight: scale(4),
    paddingVertical: verticalScale(4),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24
  },
  inputBox: {
    flex: 1,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(2),
  },
  input: {
    fontSize: moderateScale(15),
    color: "#1F2937",
    maxHeight: verticalScale(100),
    paddingVertical: verticalScale(8),
    paddingHorizontal: 0,
    lineHeight: moderateScale(20)
  },
  sendButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "#db9a4a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#db9a4a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0.1
  },
});
