import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MyStatusBar from "../components/MyStatusbar";
import MyLoader from "../components/MyLoader";
import TranslateText from "../language/TranslatedText";
import { Fonts, Sizes } from "../assets/style";
import { SCREEN_WIDTH } from "../config/Screen";
import LoginArrow from "../svgicons/LoginArrow";
import OrIcon from "../svgicons/OrIcon";
import Ionicons from "react-native-vector-icons/Ionicons";

import { colors } from "../config/Constants1";
import api from "./../apiConfig";
import axios from "axios";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const scale = (size) => (width / guidelineBaseWidth) * size;

const isSmallDevice = width < 360;
const isTablet = width >= 768;
const LoginScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);

  // Switch UI
  const [loginType, setLoginType] = useState("phone");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [callingCode, setCallingCode] = useState("91");

  const [email, setEmail] = useState("");

  // --------------------------------------------------------
  // PHONE LOGIN
  // --------------------------------------------------------
  const loginWithPhone = async () => {
    const phoneRegex = /^\d{10}$/;

    if (!phoneNumber) {
      Alert.alert("Warning", "Please enter mobile number");
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Warning", "Please enter correct mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${api}/customers/customer-login`,
        { phoneNumber },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (data.success === true) {
        Toast.show({
          type: "success",
          text1: "OTP Sent!",
          text2: data.message || "OTP sent successfully!",
        });

        props.navigation.navigate("Otp", {
          phoneNumber,
          callingCode,
          newCustomer:
            data?.message === "New customer added successfully" ? true : false,
        });
      } else {
        Alert.alert("Login Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Phone Login API Error:", error);
      Alert.alert("Error", "Unable to login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------
  // EMAIL LOGIN
  // --------------------------------------------------------
  const loginWithEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      Alert.alert("Warning", "Please enter email");
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Warning", "Please enter valid email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${api}/customers/customer-login`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = response.data;

      if (data.success === true) {
        Toast.show({
          type: "success",
          text1: "OTP Sent!",
          text2: data.message || "OTP sent successfully!",
        });
        props.navigation.navigate("Otp", {
          email,
          newCustomer:
            data?.message === "New customer added successfully" ? true : false,
        });
      } else {
        Alert.alert("Login Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Email Login API Error:", error);
      Alert.alert("Error", "Unable to login. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <MyStatusBar
      backgroundColor={colors.statusBarBg}
      barStyle="dark-content"
    />

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MyLoader isVisible={isLoading} />

        {/* TOP LOGO */}
        <View style={styles.logoView}>
          <Image
            source={require("../assets/images/newLogo.png")}
            style={styles.loginLogo}
          />

          <Text style={styles.loginImageText1} allowFontScaling={false}>
            <TranslateText title="AstroBook" />
          </Text>

          <Text style={styles.loginImageText} allowFontScaling={false}>
            <TranslateText title="Your Celestial Guidance App" />
          </Text>
        </View>

        {/* LOGIN SWITCH INFO */}
        <Text style={styles.loginSignupText} allowFontScaling={false}>
          <TranslateText title="Logging in Globally? Choose Email Login" />
        </Text>

        {/* SWITCH TABS */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            onPress={() => setLoginType("phone")}
            style={[
              styles.switchBtn,
              loginType === "phone" && styles.activeSwitch,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.switchText,
                loginType === "phone" && styles.activeSwitchText,
              ]}
              allowFontScaling={false}
            >
              Phone Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLoginType("email")}
            style={[
              styles.switchBtn,
              loginType === "email" && styles.activeSwitch,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.switchText,
                loginType === "email" && styles.activeSwitchText,
              ]}
              allowFontScaling={false}
            >
              Email Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* INPUT AREA */}
        <View style={styles.inputView}>
          {loginType === "phone" && (
            <>
              <View style={styles.phoneInputWrapper}>
                <Text style={styles.callingCodeText} allowFontScaling={false}>
                  +{callingCode}
                </Text>

                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    if (/^\d{0,10}$/.test(text)) setPhoneNumber(text);
                  }}
                  keyboardType="number-pad"
                  placeholder="Phone Number"
                  style={styles.phoneTextInput}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={loginWithPhone}
                activeOpacity={0.8}
              >
                <Text />
                <Text style={styles.loginText} allowFontScaling={false}>
                  <TranslateText title="GET OTP" />
                </Text>
                <LoginArrow />
              </TouchableOpacity>
            </>
          )}

          {loginType === "email" && (
            <>
              <View style={styles.phoneInputWrapper}>
                <Ionicons name="mail-outline" size={scale(18)} color="#444" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter Email"
                  style={styles.phoneTextInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.loginBtn}
                onPress={loginWithEmail}
                activeOpacity={0.8}
              >
                <Text />
                <Text style={styles.loginText} allowFontScaling={false}>
                  GET EMAIL OTP
                </Text>
                <LoginArrow />
              </TouchableOpacity>
            </>
          )}

          {/* DISCLAIMER */}
          <Text style={styles.loginSignupText} allowFontScaling={false}>
            By signing up, you agree to our{" "}
            <Text
              style={styles.linkText}
              onPress={() =>
                props.navigation.navigate("TermsConditionsScreen")
              }
            >
              Terms of Use
            </Text>{" "}
            and{" "}
            <Text
              style={styles.linkText}
              onPress={() =>
                props.navigation.navigate("PrivacyPolicyScreen")
              }
            >
              Privacy Policy
            </Text>
          </Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber} allowFontScaling={false}>
                50K+
              </Text>
              <Text style={styles.statLabel} allowFontScaling={false}>
                Consultations
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber} allowFontScaling={false}>
                100%
              </Text>
              <Text style={styles.statLabel} allowFontScaling={false}>
                Privacy
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber} allowFontScaling={false}>
                15+
              </Text>
              <Text style={styles.statLabel} allowFontScaling={false}>
                Years of Exp.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: scale(30),
  },

  logoView: {
    alignItems: "center",
    backgroundColor: "#db9a4a",
    paddingTop: scale(40),
    paddingBottom: scale(20),
  },

  loginLogo: {
    width: width * 0.6,
    height: width * 0.35,
    resizeMode: "contain",
  },

  loginImageText1: {
    fontSize: isTablet ? scale(42) : scale(32),
    fontWeight: "700",
    color: "#000",
  },

  loginImageText: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#000",
    marginTop: scale(4),
  },

  switchRow: {
    flexDirection: "row",
    marginTop: scale(20),
    marginHorizontal: scale(16),
  },

  switchBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(8),
    backgroundColor: "#eee",
    marginHorizontal: scale(4),
    minHeight: scale(44),
    justifyContent: "center",
  },

  activeSwitch: {
    backgroundColor: "#db9a4a",
  },

  switchText: {
    textAlign: "center",
    fontSize: scale(14),
    color: "#555",
  },

  activeSwitchText: {
    color: "#fff",
    fontWeight: "700",
  },

  inputView: {
    paddingHorizontal: scale(16),
    marginTop: scale(25),
  },

  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: scale(10),
  },

  callingCodeText: {
    fontSize: scale(16),
  },

  phoneTextInput: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: scale(16),
    paddingVertical: Platform.OS === "android" ? 0 : scale(6),
  },

  loginBtn: {
    backgroundColor: "#db9a4a",
    borderRadius: scale(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(14),
    paddingHorizontal: scale(20),
    marginTop: scale(24),
    minHeight: scale(48),
  },

  loginText: {
    color: "#fff",
    fontSize: scale(16),
    fontWeight: "600",
  },

  loginSignupText: {
    textAlign: "center",
    marginTop: scale(20),
    fontSize: scale(13),
    color: "#000",
  },

  linkText: {
    textDecorationLine: "underline",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(30),
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: scale(18),
    fontWeight: "700",
    color: "#db9a4a",
  },

  statLabel: {
    fontSize: scale(12),
    color: "#444",
    marginTop: scale(2),
  },

  separator: {
    width: 1,
    height: "60%",
    backgroundColor: "#e5caa0",
  },
});


export default LoginScreen;
