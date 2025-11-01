// App.js
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';

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
      const app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized:', app.name);
    } catch (error) {
      console.log('⚙️ Firebase already initialized:', error.message);
    }
  }, []);

  return <AppNavigator />;
}
