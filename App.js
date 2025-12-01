// App.js
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { initializeApp } from '@react-native-firebase/app';
import messaging from "@react-native-firebase/messaging";
import { navigate } from "./src/navigation/navigationRef";

LogBox.ignoreLogs(['Setting a timer']);

const firebaseConfig = {
  apiKey: "AIzaSyDpFoGJ0glT_V8Qy2ybG4uhbX6KI0Plv20",
  authDomain: "astrobook-f654b.firebaseapp.com",
  databaseURL: "https://astrobook-f654b-default-rtdb.firebaseio.com",
  projectId: "astrobook-f654b",
  storageBucket: "astrobook-f654b.appspot.com",
  messagingSenderId: "87240796994",
  appId: "1:87240796994:web:f67a36c9d8d5ec142836db",
  measurementId: "G-V0NYNE59PV",
};

export default function App() {
  useEffect(() => {
    try {
      initializeApp(firebaseConfig);
      console.log("🔥 Firebase initialized");
    } catch (e) {
      console.log("⚙️ Firebase already initialized");
    }

    const unsubscribe = messaging().onMessage(async (msg) => {
      console.log("📩 MESSAGE RECEIVED:", msg.data);
      // if (msg.data.type === "customer_upcoming_consultation") {

      //   navigate("UserConsultationList", {
      //     bookingId: msg.data.bookingId,
      //     channelName: msg.data.channelName,
      //   });
      // }
      if (msg.data?.type === "incoming_call") {
        navigate("UserIncomingCallPopup", {
          booking: JSON.parse(msg.data.booking),
          astrologerData: JSON.parse(msg.data.astrologerData),
          channelName: msg.data.channelName,
        });
      }
    });

    return unsubscribe;
  }, []);

  return <AppNavigator />;
}
