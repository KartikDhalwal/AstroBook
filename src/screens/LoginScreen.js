import React, { useState } from 'react';
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
} from 'react-native';
import MyStatusBar from '../components/MyStatusbar';
import MyLoader from '../components/MyLoader';
import TranslateText from '../language/TranslatedText';
import { Fonts, Sizes } from '../assets/style';
import { SCREEN_WIDTH } from '../config/Screen';
import LoginArrow from '../svgicons/LoginArrow';
import OrIcon from '../svgicons/OrIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors } from '../config/Constants1';
import api from './../apiConfig';
import axios from 'axios';

const LoginScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callingCode, setCallingCode] = useState('91'); // default India

  const loginWithPhone = async () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      Alert.alert('Warning', 'Please enter mobile number');
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Warning', 'Please enter correct mobile number');
      return;
    }

    setIsLoading(true);
    try {
      if (phoneNumber == '9828719021') {
        props.navigation.navigate('Otp', { phoneNumber, callingCode });
      }
      const response = await axios.post(`${api}/customers/customer-login`, {
        phoneNumber,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;
      console.log('Login Response:', data);

      if (data.success === true) {
        Alert.alert('Success', data.message || 'OTP sent successfully!');
        props.navigation.navigate('Otp', { phoneNumber, callingCode });
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong.');
        props.navigation.navigate('Otp', { phoneNumber, callingCode });
      }
    } catch (error) {
      console.error('Login API Error:', error);
      Alert.alert('Error', 'Unable to login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    if (!phoneNumber) {
      Alert.alert('Warning', 'Please enter mobile number');
      return;
    }
    Alert.alert('Success', `Signup button clicked for +${callingCode}${phoneNumber}`);
    props.navigation.navigate('SignUp', { phoneNumber, callingCode });
  };
  return (
    <ScrollView style={styles.container}>
      <MyStatusBar backgroundColor={colors.statusBarBg} barStyle="dark-content" />
      <MyLoader isVisible={isLoading} />

      {/* Logo Section */}
      <View style={styles.logoView}>
        <Image source={require('../assets/images/newLogo.png')} style={styles.loginLogo} />
        <Text style={styles.loginImageText1}>
          <TranslateText title="AstroBook" />
        </Text>
        <Text style={styles.loginImageText}>
          <TranslateText title="Your Astrology Search Ends Here" />
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputView}>
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
        {/* <TouchableOpacity style={styles.loginBtn} onPress={handleSignup}>
          <Text />
          <Text style={styles.loginText}>SIGN UP</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.loginBtn} onPress={loginWithPhone}>
          <Text />
          <Text style={styles.loginText}><TranslateText title="GET OTP" /></Text>
          <LoginArrow />
        </TouchableOpacity>

        <Text style={styles.loginSignupText}>
          <TranslateText title=" By Signing up, you agree to our " />
          <Text style={styles.linkText} onPress={() => Linking.openURL('https://astrobook.co.in/terms-of-use')}>
            <TranslateText title="Term of Use " />
          </Text>
          <TranslateText title="and " />
          <Text style={styles.linkText} onPress={() => Linking.openURL('https://astrobook.co.in/privacy-policy')}>
            <TranslateText title="Privacy Policy" />
          </Text>
        </Text>

        <View style={styles.orIconWrapper}>
          <OrIcon width={SCREEN_WIDTH * 0.9} />
        </View>

        {/* Google & Facebook Login Buttons (placeholder, no library) */}
        <View style={styles.socialLoginView}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Info', 'Google Login coming soon')}>
            <Ionicons name="call" color="#039ce3ff" size={24} />
            <Text style={styles.socialText}><TranslateText title="TrueCaller" /></Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Info', 'Facebook Login coming soon')}>
            <FacebookIcon width={30} height={30} />
            <Text style={styles.socialText}><TranslateText title="Facebook" /></Text>
          </TouchableOpacity> */}
        </View>
       <View style={styles.statsRow}>
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>50K+</Text>
    <Text style={styles.statLabel}>Consultations</Text>
  </View>
  <View style={styles.statBox}>
    <Text style={styles.statNumber}>20+</Text>
    <Text style={styles.statLabel}>Years of Experience</Text>
  </View>
  <View style={[styles.statBox, { borderRightWidth: 0 }]}>
    <Text style={styles.statNumber}>100%</Text>
    <Text style={styles.statLabel}>Privacy</Text>
  </View>
</View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  logoView: { flex: 0.45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#db9a4a', paddingBottom: 15 },
  loginLogo: { width: SCREEN_WIDTH * 0.7, height: SCREEN_WIDTH * 0.4, resizeMode: 'contain' },
  loginImageText: { color: '#000', textAlign: 'center', ...Fonts.primaryHelvetica, fontWeight: '700', fontSize: 18 },
  loginImageText1: { color: '#000', textAlign: 'center', ...Fonts.primaryHelvetica, fontWeight: '700', fontSize: 50 },
  inputView: { flex: 0.55, paddingHorizontal: 15, paddingTop: 40 },
  phoneInputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 5, marginBottom: 20 },
  callingCodeText: { fontSize: 16, color: '#000' },
  phoneTextInput: { flex: 1, fontSize: 16, color: '#000', paddingVertical: 5, marginLeft: 5 },
  loginBtn: { backgroundColor: '#db9a4a', borderRadius: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  loginText: { color: '#fff', textAlign: 'center', ...Fonts.primaryHelvetica, fontWeight: '500', fontSize: 16 },
  loginSignupText: { color: '#000', textAlign: 'center', ...Fonts.primaryHelvetica, fontWeight: '500', fontSize: 12, marginTop: 15 },
  linkText: { textDecorationLine: 'underline' },
  orIconWrapper: { marginTop: Sizes.fixPadding * 4 },
  socialLoginView: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.3, justifyContent: 'center', paddingVertical: 8, borderRadius: 8, width: SCREEN_WIDTH * 0.4, gap: 6 },
  socialText: { color: '#000', ...Fonts.primaryHelvetica, fontWeight: '500', fontSize: 14 },
    statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 80,
    // backgroundColor: '#fff7ef',
    // borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5caa0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#db9a4a',
    ...Fonts.primaryHelvetica,
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    textAlign: 'center',
    ...Fonts.primaryHelvetica,
  },

});

export default LoginScreen;
