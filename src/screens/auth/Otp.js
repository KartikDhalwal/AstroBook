import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MyStatusBar from '../../components/MyStatusbar';
import { colors, Fonts } from '../../config/Constants1';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import MyLoader from '../../components/MyLoader';
import CountDown from './components/CountDown';
import TranslateText from '../../language/TranslatedText';
import Ionicons from 'react-native-vector-icons/Ionicons';

import OrIcon from '../../svgicons/OrIcon';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../config/Screen';
import { responsiveScreenWidth } from 'react-native-responsive-dimensions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('screen');
const CELL_COUNT = 4;

const Otp = (props) => {
  const navigation = useNavigation();
  const { phoneNumber, newCustomer } = props.route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('');
  const [counter, setCounter] = useState(59);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [otpprops, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

  useEffect(() => {
    props.navigation.setOptions({ headerShown: false });
  }, [props.navigation]);

  // Auto verify when OTP is complete
  useEffect(() => {
    if (value.length === CELL_COUNT) handleOtpVerification();
  }, [value]);

  const handleOtpVerification = async () => {
    setIsLoading(true);
    try {
      // Replace this with your API call
      if(newCustomer){
        Alert.alert('Success', 'Please Fill Details!');
        navigation.replace('SignUp');
      }
      else{ navigation.replace('Home');}
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to verify OTP. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setCounter(60);
    setIsLoading(true);
    try {
      // Replace this with your resend API call
      Alert.alert('Success', 'OTP resent successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateState = useCallback(() => setCounter(0), []);

  return (
    <View style={styles.container}>
      {/* Watermark */}
      <Image
        source={require('../../assets/images/logoBlack.png')}
        style={styles.watermarkImage}
      />


      <MyStatusBar backgroundColor={colors.book_status_bar} barStyle="dark-content" />
      <MyLoader isVisible={isLoading} />

      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={26} color="#db9a4a" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            Verify Phone
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpText}>
            <TranslateText title="OTP Sent to" />{' '}
            <Text style={styles.phoneText}>+91-{phoneNumber}</Text>
          </Text>

          <View style={styles.codeFieldContainer}>
            <CodeField
              ref={ref}
              {...otpprops}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
          </View>

          {/* Resend OTP */}
          <View style={styles.otpFooterRow}>
            {counter !== 0 ? (
              <>
                <Text style={styles.otpText2}>
                  <TranslateText title="Resend OTP available in" />
                </Text>
                <Text style={styles.resendTimer}>
                  <CountDown duration={counter} updateState={updateState} />s
                </Text>
              </>
            ) : (
              <TouchableOpacity onPress={resendOtp}>
                <Text style={styles.resendText}>
                  <TranslateText title="Resend" />
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.orIconContainer}>
            <OrIcon width={SCREEN_WIDTH * 0.9} />
          </View>
          {/* Social Login */}
          <View style={styles.googleView}>
            <TouchableOpacity style={styles.googleBtn}>
              <Ionicons name="call" color="#039ce3ff" size={24} />
              <Text style={styles.googleText}><TranslateText title="TrueCaller" /></Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.googleBtn}>
            <FacebookIcon width={30} height={30} />
            <Text style={styles.googleText}><TranslateText title="Facebook" /></Text>
          </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </View>
  );

};

export default Otp;

const styles = StyleSheet.create({
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    flex: 1,
    textAlign: 'center',
  },
 watermarkImage: {
  position: 'absolute',
  opacity: 0.05,
  width: SCREEN_WIDTH * 1.5, // fills entire width
  height: SCREEN_HEIGHT * 1.0, // fills height
  resizeMode: 'contain',
  top: SCREEN_HEIGHT * 0.1,
  left: -SCREEN_WIDTH * 0.25,
  zIndex: -1,
},



  codeFieldContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  codeFieldRoot: {
    justifyContent: 'space-between',
  },
  cell: {
    width: 50,
    height: 50,
    lineHeight: 48,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 2, // ✅ Make border bold
    borderColor: '#000', // You can change color as needed
    borderRadius: 8,
    marginHorizontal: 5,
    color: '#000',
  },
  focusCell: {
    borderColor: '#f8bd01', // Highlight border when focused
    borderWidth: 3, // ✅ Even bolder when focused
  },

  container: { flex: 1, backgroundColor: colors.background_theme1 },
  innerContainer: { flex: 1 },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 15,
    backgroundColor: colors.book_status_bar,
  },
  verifyText: { ...Fonts.black11InterMedium, fontSize: 15 },
  otpContainer: { paddingTop: SCREEN_HEIGHT * 0.2 },
  otpText: { ...Fonts.black11InterMedium, fontSize: 14, textAlign: 'center' },
  phoneText: { color: '#381415' },
  otpFooterRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SCREEN_HEIGHT * 0.1 },
  otpText2: { ...Fonts.black11InterMedium, fontSize: 13, marginRight: 3 },
  resendTimer: { color: '#611D09' },
  resendText: { color: '#611D09' },
  orIconContainer: { marginTop: 20, paddingHorizontal: 15 },
  googleView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.3, justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, width: responsiveScreenWidth(40) },
  googleText: { color: '#000', ...Fonts.primaryHelvetica, fontWeight: '500' },
});
