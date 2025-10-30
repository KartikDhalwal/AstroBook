import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/auth/Otp';
import ShowHoroscope from '../screens/customer/ShowHoroscope';
import VoiceVideoCallScreen from '../screens/VoiceVideoCallScreen';
import AstrolgersList from '../screens/AstrolgersList';
import PoojaList from '../screens/PoojaList';
import PoojaDetails from '../screens/PoojaDetails';
import ChatScreen from '../screens/ChatScreen';
import AstrologerDetailsScreen from '../screens/AstrologerDetailsScreen';
import BottomTabs from '../components/BottomTabs'; // Import your tab navigator

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Home" component={BottomTabs} /> 
        <Stack.Screen name="ShowHoroscope" component={ShowHoroscope} />
        <Stack.Screen name="VoiceVideoCallScreen" component={VoiceVideoCallScreen} />
        <Stack.Screen name="AstrolgersList" component={AstrolgersList} />
        <Stack.Screen name="AstrologerDetailsScreen" component={AstrologerDetailsScreen} />
        <Stack.Screen name="PoojaList" component={PoojaList} />
        <Stack.Screen name="PoojaDetails" component={PoojaDetails} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
