import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import api from "../apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ContactDetailsScreen = ({ route }) => {
    const [phoneNumber, setPhoneNumber] = useState(route?.params?.phoneNumber ?? '');
    const [email, setEmail] = useState(route?.params?.email ?? '');
    const [otp, setOtp] = useState("");
    const [customerId, setCustomerId] = useState(route?.params?.customerId || null);
    const [step, setStep] = useState("input");
    const [loading, setLoading] = useState(false);
    const [otpFor, setOtpFor] = useState(null);

    const navigation = useNavigation();
    const sendOtpToPhone = async () => {
        const cleanPhone = phoneNumber?.trim();

        if (!cleanPhone || cleanPhone.length !== 10) {
            return Alert.alert("Error", "Please enter a valid 10-digit phone number");
        }

        setLoading(true);
        setOtpFor("phone");

        try {
            const payload = {
                customerId,
                phoneNumber: cleanPhone,
            };
            console.log(payload)
            const res = await axios.post(
                `${api}/customers/send-update-otp`,
                payload
            );

            if (res.data.success) {
                setStep("otp");
                Alert.alert("Success", "OTP sent to mobile number");
            } else {
                Alert.alert("Error", res.data.message);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Error", "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };
    const sendOtpToEmail = async () => {
        const cleanEmail = email?.trim();

        if (!cleanEmail || !cleanEmail.includes("@")) {
            return Alert.alert("Error", "Please enter a valid email address");
        }

        setLoading(true);
        setOtpFor("email");

        try {
            const payload = {
                customerId,
                email: cleanEmail,
            };

            const res = await axios.post(
                `${api}/customers/send-update-otp`,
                payload
            );

            if (res.data.success) {
                setStep("otp");
                Alert.alert("Success", "OTP sent to email");
            } else {
                Alert.alert("Error", res.data.message);
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Error", "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };



    const verifyOtp = async () => {
        if (!otp || otp.length !== 4) {
            return Alert.alert("Error", "Please enter a valid 4-digit OTP");
        }

        setLoading(true);

        try {
            const cleanEmail = email?.trim();
            const cleanPhone = phoneNumber?.trim();
            const payload = {
                customerId,
                otp,
                ...(otpFor === "email"
                    ? { email: cleanEmail }
                    : { phoneNumber: cleanPhone }),
            };

            const res = await axios.post(
                `${api}/customers/update-contact`,
                payload
            );

            if (res.data.success) {
                await AsyncStorage.setItem(
                    "customerData",
                    JSON.stringify(res.data.customer)
                );
                navigation.replace("SignUpLogin", {
                    customerId,
                    isProfile: false,
                    isLogin: true,
                });
            } else {
                Alert.alert("Error", res.data.message || "Invalid OTP");
            }
        } catch (e) {
            console.log(e);
            Alert.alert("Error", "OTP verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleBack = () => {
        setStep("input");
        setOtp("");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>📱</Text>
                    </View>
                    <Text style={styles.title}>
                        {step === "input" ? "Verify Yourself" : "Verify OTP"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {step === "input"
                            ? "Enter your details to continue"
                            : `We've sent a code to ${phoneNumber}`}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {step === "input" ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.prefix}>+91</Text>
                                    <TextInput
                                        placeholder="Enter 10-digit number"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        style={styles.input}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>

                            {/* <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email (Optional)</Text>
                                <TextInput
                                    placeholder="your.email@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    style={[styles.input, styles.inputFull]}
                                    placeholderTextColor="#999"
                                />
                            </View> */}

                            <View style={{ gap: 12 }}>
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={sendOtpToPhone}
                                    disabled={loading}
                                >
                                    {loading && otpFor === "phone" ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send OTP to Mobile</Text>
                                    )}
                                </TouchableOpacity>

                                {/* <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { backgroundColor: "#4A90E2" },
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={sendOtpToEmail}
                                    disabled={loading}
                                >
                                    {loading && otpFor === "email" ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send OTP to Email</Text>
                                    )}
                                </TouchableOpacity> */}
                            </View>

                        </>
                    ) : (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Enter OTP</Text>
                                <TextInput
                                    placeholder="4-digit code"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                    style={[styles.input, styles.inputFull, styles.otpInput]}
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={verifyOtp}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Verify & Continue</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footerActions}>
                                <TouchableOpacity
                                    onPress={
                                        otpFor === "email" ? sendOtpToEmail : sendOtpToPhone
                                    }
                                    disabled={loading}
                                >
                                    <Text style={styles.linkText}>
                                        Resend OTP
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleBack}
                                    disabled={loading}
                                >
                                    <Text style={styles.linkText}>
                                        Change Details
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ContactDetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF8F5",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFF5E6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        shadowColor: "#db9a4a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    icon: {
        fontSize: 36,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#2C2C2C",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2C2C2C",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E8E4DC",
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    prefix: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C2C2C",
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: "#2C2C2C",
    },
    inputFull: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E8E4DC",
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#2C2C2C",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    otpInput: {
        fontSize: 24,
        fontWeight: "600",
        letterSpacing: 8,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#db9a4a",
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#db9a4a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    footerActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        paddingHorizontal: 4,
    },
    linkText: {
        color: "#db9a4a",
        fontSize: 14,
        fontWeight: "600",
    },
});