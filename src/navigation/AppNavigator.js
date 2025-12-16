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
import ChatScreen from "../screens/ChatScreen";
import TermsConditionsScreen from "../screens/TermsConditionsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import BottomTabs from "./BottomTabs";
import { navigationRef } from "../navigation/navigationRef";
import AstrolgersList from "../screens/AstrolgersList";
import SelectSlotScreenReschedule from "../screens/SlotDetailsReschedule";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
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
          options={{ headerShown: true, title: 'Profile' }}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserConsultationList"
          component={UserConsultationList}
          options={{ headerShown: true, title: 'My Consultations' }}
        />
        <Stack.Screen
          name="PoojaList"
          component={PoojaList}
          options={{ headerShown: true, title: 'Pooja' }}
        />
        <Stack.Screen
          name="PoojaDetails"
          component={PoojaDetails}
          options={{ headerShown: true, title: 'Pooja Details' }}
        />
        <Stack.Screen
          name="AstrologerDetailsScreen"
          component={AstrologerDetailsScreen}
          options={{ headerShown: true, title: "Astrologers Details" }}
        />
        <Stack.Screen
          name="SlotDetails"
          component={SlotDetails}
          options={{ headerShown: true, title: "Slot Details" }}
        />
        <Stack.Screen
          name="SelectSlotScreenReschedule"
          component={SelectSlotScreenReschedule}
          options={{ headerShown: true, title: "Slot Details" }}
        />
        <Stack.Screen
          name="KundliMatchingReportScreen"
          component={KundliMatchingReportScreen}
          options={{ headerShown: true, title: "Kundli Match" }}
        />
        <Stack.Screen
          name="UserIncomingCallScreen"
          component={UserIncomingCallScreen}
          options={{ headerShown: false, title: "Incoming Call" }}
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
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: true, title: 'AstroBook Chat' }}
        />

        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ headerShown: false }} // Tabs have their own screens
        />
        <Stack.Screen
          name="TermsConditionsScreen"
          component={TermsConditionsScreen}
          options={{ headerShown: false, title: 'Terms & Conditions' }} // Tabs have their own screens
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false, title: 'Terms & Conditions' }} // Tabs have their own screens
        />
        <Stack.Screen
          name="VideoList"
          component={props => <AstrolgersList {...props} mode="video" />}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
