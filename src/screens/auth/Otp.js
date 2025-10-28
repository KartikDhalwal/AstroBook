import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import GoogleIcon from '../../svgicons/GoogleIcon';
import FacebookIcon from '../../svgicons/FacebookIcon';
import OrIcon from '../../svgicons/OrIcon';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../config/Screen';
import { responsiveScreenWidth } from 'react-native-responsive-dimensions';

const { width } = Dimensions.get('screen');
const CELL_COUNT = 4;

const Otp = (props) => {
  const navigation = useNavigation();
  const { phoneNumber } = props.route.params;

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
      const response = true;
      if (response) navigation.replace('Home');
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
      <MyStatusBar backgroundColor={colors.book_status_bar} barStyle="dark-content" />
      <MyLoader isVisible={isLoading} />

      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.otpHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.verifyText}>
            <TranslateText title="Verify Phone" />
          </Text>
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
              <GoogleIcon width={30} height={30} />
              <Text style={styles.googleText}><TranslateText title="Google" /></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.googleBtn}>
              <FacebookIcon width={30} height={30} />
              <Text style={styles.googleText}><TranslateText title="Facebook" /></Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Otp;

const styles = StyleSheet.create({
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
  codeFieldContainer: { paddingHorizontal: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: width * 0.15,
    height: width * 0.14,
    lineHeight: 32,
    fontSize: 19,
    borderWidth: 0.27,
    borderRadius: 5,
    borderColor: '#f8bd01',
    textAlign: 'center',
    paddingTop: 5,
    marginTop: 10,
    color: '#000',
  },
  focusCell: { borderColor: colors.background_theme4 },
  otpFooterRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SCREEN_HEIGHT * 0.1 },
  otpText2: { ...Fonts.black11InterMedium, fontSize: 13, marginRight: 3 },
  resendTimer: { color: '#611D09' },
  resendText: { color: '#611D09' },
  orIconContainer: { marginTop: 20, paddingHorizontal: 15 },
  googleView: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 30 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.3, justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, width: responsiveScreenWidth(40) },
  googleText: { color: '#000', ...Fonts.primaryHelvetica, fontWeight: '500' },
});
