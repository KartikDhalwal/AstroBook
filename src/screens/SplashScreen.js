import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MyStatusBar from '../components/MyStatusbar';
import { colors } from '../config/Constants1';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config/Screen';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Navigate to Login after 2 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MyStatusBar backgroundColor={colors.background_theme2} barStyle="dark-content" />
      <Image
        source={require('../assets/astrobookimages/onboardingscreen.png')}
        style={styles.splashImage}
      />
    </View>
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
