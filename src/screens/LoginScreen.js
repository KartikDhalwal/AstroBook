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
    <ScrollView style={styles.container}>
      <MyStatusBar backgroundColor={colors.statusBarBg} barStyle="dark-content" />
      <MyLoader isVisible={isLoading} />

      {/* TOP LOGO */}
      <View style={styles.logoView}>
        <Image
          source={require("../assets/images/newLogo.png")}
          style={styles.loginLogo}
        />
        <Text style={styles.loginImageText1}>
          <TranslateText title="AstroBook" />
        </Text>
        <Text style={styles.loginImageText}>
          <TranslateText title="Your Astrology Search Ends Here" />
        </Text>
      </View>

      {/* LOGIN SWITCH TABS */}
      <Text style={[styles.loginSignupText]}>

        <TranslateText title="Logging in Globally? Choose Email Login" />
      </Text>
      <View style={styles.switchRow}>

        <TouchableOpacity
          onPress={() => setLoginType("phone")}
          style={[
            styles.switchBtn,
            loginType === "phone" && styles.activeSwitch,
          ]}
        >
          <Text
            style={[
              styles.switchText,
              loginType === "phone" && styles.activeSwitchText,
            ]}
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
        >
          <Text
            style={[
              styles.switchText,
              loginType === "email" && styles.activeSwitchText,
            ]}
          >
            Email Login
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputView}>
        {/* ------------------------ PHONE UI ------------------------ */}
        {loginType === "phone" && (
          <>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.callingCodeText}>+{callingCode}</Text>

              <TextInput
                value={phoneNumber}
                onChangeText={(text) => {
                  if (/^\d{0,10}$/.test(text)) setPhoneNumber(text);
                }}
                keyboardType="number-pad"
                placeholder="Phone Number"
                style={styles.phoneTextInput}
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={loginWithPhone}>
              <Text />
              <Text style={styles.loginText}>
                <TranslateText title="GET OTP" />
              </Text>
              <LoginArrow />
            </TouchableOpacity>
          </>
        )}

        {/* ------------------------ EMAIL UI ------------------------ */}
        {loginType === "email" && (
          <>
            <View style={styles.phoneInputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#444" />
              <TextInput
                value={email}
                onChangeText={(t) => setEmail(t)}
                placeholder="Enter Email"
                style={styles.phoneTextInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={loginWithEmail}>
              <Text />
              <Text style={styles.loginText}>GET EMAIL OTP</Text>
              <LoginArrow />
            </TouchableOpacity>
          </>
        )}

        {/* Disclaimer */}
        <Text style={styles.loginSignupText}>
          By signing up, you agree to our{" "}
          <Text
            style={styles.linkText}
            onPress={() => props.navigation.navigate("TermsConditionsScreen")}
          >
            Terms of Use{" "}
          </Text>
          and{" "}
          <Text
            style={styles.linkText}
            onPress={() => props.navigation.navigate("PrivacyPolicyScreen")}
          >
            Privacy Policy
          </Text>
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>

          <View style={styles.separator} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Privacy</Text>
          </View>

          <View style={styles.separator} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>20+</Text>
            <Text style={styles.statLabel}>Years of Exp.</Text>
          </View>

        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  logoView: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#db9a4a",
    paddingBottom: 15,
    paddingTop: 40,
  },

  loginLogo: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.4,
    resizeMode: "contain",
  },

  loginImageText1: {
    color: "#000",
    ...Fonts.primaryHelvetica,
    fontSize: 50,
    fontWeight: "700",
  },

  loginImageText: {
    color: "#000",
    ...Fonts.primaryHelvetica,
    fontSize: 18,
    fontWeight: "700",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },

  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginHorizontal: 5,
  },

  activeSwitch: {
    backgroundColor: "#db9a4a",
  },

  switchText: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
  },

  activeSwitchText: {
    color: "#fff",
    fontWeight: "700",
  },

  inputView: { paddingHorizontal: 15, marginTop: 25 },

  phoneInputWrapper: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },

  callingCodeText: { fontSize: 16 },

  phoneTextInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  emailWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: "#ccc",
  },

  emailInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },

  loginBtn: {
    backgroundColor: "#db9a4a",
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 25,
  },

  loginText: {
    color: "#fff",
    ...Fonts.primaryHelvetica,
    fontWeight: "600",
    fontSize: 16,
  },

  loginSignupText: {
    color: "#000",
    textAlign: "center",
    marginTop: 20,
  },

  linkText: {
    textDecorationLine: "underline",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#db9a4a",
  },

  statLabel: {
    fontSize: 12,
    color: "#444",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },

  separator: {
    width: 1,
    height: "60%", // adjust height if needed
    backgroundColor: "#e5caa0",
  },

});

export default LoginScreen;
