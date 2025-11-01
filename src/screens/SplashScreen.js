import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MyStatusBar from '../components/MyStatusbar';
import { colors } from '../config/Constants1';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config/Screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const customerData = await AsyncStorage.getItem('customerData');

        if (isLoggedIn === 'true' && customerData) {
          // ✅ User is already logged in
          navigation.replace('Home');
        } else {
          // ⏰ Wait 2 seconds before going to Login
          setTimeout(() => {
            navigation.replace('Login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // fallback to login
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar backgroundColor={colors.background_theme2} barStyle="dark-content" />
      <Image
        source={require('../assets/astrobookimages/onboardingscreenNew.jpeg')}
        style={styles.splashImage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splashImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: 'cover',
  },
});

export default SplashScreen;
