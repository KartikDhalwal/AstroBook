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
import { CommonActions } from '@react-navigation/native';

LogBox.ignoreLogs(['Setting a timer']);
async function checkCustomerDetails() {
  try {
    const raw = await AsyncStorage.getItem('customerData');

    if (!raw) {
      redirectToSignup();
      return;
    }

    let customer;
    try {
      customer = JSON.parse(raw);
    } catch {
      redirectToSignup();
      return;
    }

    const requiredFields = [
      'customerName',
      'phoneNumber',
      'gender',
      'dateOfBirth',
      'timeOfBirth',
    ];

    const isInvalid = requiredFields.some(
      key => !customer?.[key] || String(customer[key]).trim() === ''
    );

    if (isInvalid) {
      redirectToSignup();
    }
  } catch (error) {
    console.log('❌ Customer check failed:', error);
    redirectToSignup();
  }
}

function redirectToSignup() {
  if (!navigationRef.isReady()) {
    setTimeout(redirectToSignup, 100);
    return;
  }

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'SignUp' }],
    })
  );
}

async function requestNotificationPermission() {
  try {
    // iOS & Android (Firebase handles platform differences)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // Required for iOS 13+ (Notifee)
    await notifee.requestPermission();

    console.log('🔔 Notification permission:', enabled ? 'GRANTED' : 'DENIED');
  } catch (err) {
    console.log('❌ Notification permission error:', err);
  }
}

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
  useEffect(() => {
    requestNotificationPermission(); // 👈 ask permission on app start
    createCallChannel();             // existing call channel
  }, []);

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
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'UserIncomingCallPopup',
                params: {
                  booking: JSON.parse(msg.data.booking),
                  astrologerData: JSON.parse(msg.data.astrologerData),
                  channelName: msg.data.channelName,
                },
              },
            ],
          })
        );
      }
    });

    // 🔹 BACKGROUND (app in memory)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      async remoteMessage => {
        await saveNotificationToDB(remoteMessage);

        if (remoteMessage?.data?.type === 'incoming_call') {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'UserIncomingCallPopup',
                  params: {
                    booking: JSON.parse(remoteMessage.data.booking),
                    astrologerData: JSON.parse(remoteMessage.data.astrologerData),
                    channelName: remoteMessage.data.channelName,
                  },
                },
              ],
            })
          );
        }
      }
    );

    // 🔹 KILLED STATE
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (!remoteMessage || initialNotificationHandled.current) return;

        initialNotificationHandled.current = true;
        await saveNotificationToDB(remoteMessage);

        const interval = setInterval(() => {
          if (!navigationRef.isReady()) return;

          clearInterval(interval);

          if (remoteMessage.data?.type === 'incoming_call') {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'UserIncomingCallPopup',
                    params: {
                      booking: JSON.parse(remoteMessage.data.booking),
                      astrologerData: JSON.parse(remoteMessage.data.astrologerData),
                      channelName: remoteMessage.data.channelName,
                    },
                  },
                ],
              })
            );
          }
        }, 100);
      });

    return () => {
      unsubscribe();
      unsubscribeOpened();
    };
  }, []);
useEffect(() => {
  const bootstrap = async () => {
    await checkCustomerDetails();
  };

  bootstrap();
}, []);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}
