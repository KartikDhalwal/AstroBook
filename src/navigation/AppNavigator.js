import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/auth/Otp";
import SignUp from "../screens/SignUp";
import UserConsultationList from "../screens/UserConsultationList";
import PoojaList from "../screens/PoojaList";
import PoojaDetails from "../screens/PoojaDetails";
import AstrologerDetailsScreen from "../screens/AstrologerDetailsScreen";
import SlotDetails from "../screens/SlotDetails";
import UserIncomingCallScreen from "../screens/UserIncomingCallScreen";
import UserIncomingCallPopup from "../screens/UserIncomingCallPopup";
import KundliMatchingReportScreen from "../screens/KundliMatchingReportScreen";
import KundliScreen from "../screens/KundliScreen";
import ConsultationDetailsScreen from "../screens/ConsultationDetailsScreen";
import BottomTabs from "./BottomTabs";
import { navigationRef } from "../navigation/navigationRef";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>

      <Stack.Navigator
        screenOptions={{
          headerShown: false,        // 🔥 enable top header globally
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserConsultationList"
          component={UserConsultationList}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="PoojaList"
          component={PoojaList}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="PoojaDetails"
          component={PoojaDetails}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="AstrologerDetailsScreen"
          component={AstrologerDetailsScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="SlotDetails"
          component={SlotDetails}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="KundliMatchingReportScreen"
          component={KundliMatchingReportScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="UserIncomingCallScreen"
          component={UserIncomingCallScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="UserIncomingCallPopup"
          component={UserIncomingCallPopup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Free Kundli"
          component={KundliScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Consultation Details"
          component={ConsultationDetailsScreen}
          options={{ headerShown: true }}
        />
        
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ headerShown: false }} // Tabs have their own screens
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
