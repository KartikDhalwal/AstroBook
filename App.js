// App.js
import React, { useEffect, useRef } from 'react';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { navigate, navigationRef } from './src/navigation/navigationRef';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from './src/apiConfig';

LogBox.ignoreLogs(['Setting a timer']);

async function createCallChannel() {
  await notifee.createChannel({
    id: 'incoming_calls',
    name: 'Incoming Calls',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export default function App() {
  const initialNotificationHandled = useRef(false);

  // 🔹 SAVE NOTIFICATION TO DB
  const saveNotificationToDB = async (remoteMessage) => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem('customerData'));
      if (!userData?._id) return;

      await axios.post(`${api}/mobile/notifications`, {
        userId: userData._id,
        type: remoteMessage?.data?.type,
        title: remoteMessage?.notification?.title || 'Notification',
        body: remoteMessage?.notification?.body || '',
        data: remoteMessage?.data || {},
      });
    } catch (e) {
      console.log('Notification save failed:', e?.message);
    }
  };

  useEffect(() => {
    createCallChannel();
  }, []);

  useEffect(() => {
    // 🔹 FOREGROUND
    const unsubscribe = messaging().onMessage(async msg => {
      await saveNotificationToDB(msg);

      if (msg.data?.type === 'incoming_call') {
        navigate('UserIncomingCallPopup', {
          booking: JSON.parse(msg.data.booking),
          astrologerData: JSON.parse(msg.data.astrologerData),
          channelName: msg.data.channelName,
        });
      }
    });

    // 🔹 BACKGROUND (app in memory)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        await saveNotificationToDB(remoteMessage);

        if (remoteMessage?.data?.type === 'incoming_call') {
          navigate('UserIncomingCallPopup', {
            booking: JSON.parse(remoteMessage.data.booking),
            astrologerData: JSON.parse(remoteMessage.data.astrologerData),
            channelName: remoteMessage.data.channelName,
          });
        }
      }
    );

    // 🔹 KILLED STATE
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (
          remoteMessage &&
          !initialNotificationHandled.current
        ) {
          initialNotificationHandled.current = true;

          await saveNotificationToDB(remoteMessage);

          const interval = setInterval(() => {
            if (navigationRef.isReady()) {
              clearInterval(interval);

              if (remoteMessage.data?.type === 'incoming_call') {
                navigate('UserIncomingCallPopup', {
                  booking: JSON.parse(remoteMessage.data.booking),
                  astrologerData: JSON.parse(remoteMessage.data.astrologerData),
                  channelName: remoteMessage.data.channelName,
                });
              }
            }
          }, 100);
        }
      });

    return () => {
      unsubscribe();
      unsubscribeOpened();
    };
  }, []);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}
