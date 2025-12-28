import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import HomeStack from "./HomeStack";
import VoiceCallStack from "./VoiceCallStack";
import VideoCallStack from "./VideoCallStack";
import ChatStack from "./ChatStack";
import PoojaStack from "./PoojaStack";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="VideoTab"
      screenOptions={({ route }) => ({
        headerShown: false, // header is inside STACK, not tabs!
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",

        tabBarIcon: ({ color, focused }) => {
          if (route.name === "HomeTab") {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === "VoiceTab") {
            return (
              <Ionicons
                name={focused ? "call" : "call-outline"}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === "VideoTab") {
            return (
              <Ionicons
                name={focused ? "videocam" : "videocam-outline"}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === "ChatTab") {
            return (
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === "PoojaTab") {
            return (
              <MaterialCommunityIcons
                name="campfire"
                size={26}
                color={color}
              />
            );
          }
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: "Home" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('HomeTab', { screen: 'HomeTab' });
          }
        })} />
      <Tab.Screen name="VoiceTab" component={VoiceCallStack} options={{ title: "Voice" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('VoiceTab', { screen: 'VoiceTab' });
          }
        })}
      />
      <Tab.Screen name="VideoTab" component={VideoCallStack} options={{ title: "Video" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('VideoTab', { screen: 'VideoTab' });
          }
        })}
      />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ title: "Chat" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('ChatTab', { screen: 'ChatTab' });
          }
        })}
      />
      <Tab.Screen name="PoojaTab" component={PoojaStack} options={{ title: "Pooja" }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('PoojaTab', { screen: 'PoojaTab' });
          }
        })}
      />
    </Tab.Navigator>
  );
}
