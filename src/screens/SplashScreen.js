import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config/Screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const customerData = await AsyncStorage.getItem('customerData');

        // Let video finish, then this logic will run inside onEnd()
        global.loginStatus = { isLoggedIn, customerData };
      } catch (error) {
        console.error('Error checking login status:', error);
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, []);

  const handleVideoEnd = () => {
    const { isLoggedIn, customerData } = global.loginStatus;

    if (isLoggedIn === 'true' && customerData) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        source={require('../assets/gifs/splashMp4.mp4')}
        style={styles.splashVideo}
        resizeMode="cover"
        onEnd={handleVideoEnd}
        paused={false}
        repeat={false}
        muted={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default SplashScreen;
