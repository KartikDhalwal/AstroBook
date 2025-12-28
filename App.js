  // App.js
  import React, { useEffect, useRef } from 'react';
  import { AppState, LogBox } from 'react-native';
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
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (isLoggedIn !== 'true') return;

      if (!raw) {
        redirectToSignUpLogin();
        return;
      }
      let customer;
      try {
        customer = JSON.parse(raw);
        console.log(customer)
      } catch {
        redirectToSignUpLogin();
        return;
      }

      const phone = customer?.phoneNumber?.trim();
      const email = customer?.email?.trim();
      const customerName = customer?.customerName?.trim();
      const gender = customer?.gender?.trim();
      const dateOfBirth = customer?.dateOfBirth?.trim();
      const timeOfBirth = customer?.timeOfBirth?.trim();
      const birthPlace = customer?.address?.birthPlace?.trim();

      const isPhoneMissing = !phone;
      const isEmailMissing = !email;
      const iscustomerName = !customerName;
      const isgender = !gender;
      const isdateOfBirth = !dateOfBirth;
      const istimeOfBirth = !timeOfBirth;
      const isbirthPlace = !birthPlace;

      if (isPhoneMissing) {
        redirectToContactDetails({
          customerId: customer?._id || '',
        });
        return;
      } else if (iscustomerName && isgender && isdateOfBirth && istimeOfBirth && isbirthPlace) {
        redirectToSignUpLogin();
        return
      }
    } catch (error) {
      console.log('❌ Customer check failed:', error);
      redirectToSignUpLogin();
    }
  }
  function redirectToContactDetails(params = {}) {
    if (!navigationRef.isReady()) {
      setTimeout(() => redirectToContactDetails(params), 100);
      return;
    }

    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'ContactDetailsScreen',
            params,
          },
        ],
      })
    );
  }
  function redirectToSignUpLogin() {
    if (!navigationRef.isReady()) {
      setTimeout(() => redirectToSignUpLogin(), 100);
      return;
    }

    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'SignUpLogin' }],
      })
    );
  }

  const subscribeToAllCustomers = async () => {
    await messaging().subscribeToTopic('all_customers');
    console.log('Subscribed to all_customers topic');
  };
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
    const bootstrapped = useRef(false);

    const initialNotificationHandled = useRef(false);
    useEffect(() => {
      requestNotificationPermission(); // 👈 ask permission on app start
      createCallChannel();    
      subscribeToAllCustomers();         // existing call channel
    }, []);

    useEffect(() => {
      const interval = setInterval(() => {
        if (navigationRef.isReady() && !bootstrapped.current) {
          bootstrapped.current = true;
          checkCustomerDetails();
          clearInterval(interval);
        }
      }, 100);
    
      return () => clearInterval(interval);
    }, []);
    

    const safeReset = (route) => {
      const interval = setInterval(() => {
        if (!navigationRef.isReady()) return;
    
        clearInterval(interval);
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [route],
          })
        );
      }, 100);
    };

    const safeJSON = (value) => {
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    };
    

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
      // 🔹 FOREGROUND
      const unsubscribe = messaging().onMessage(async msg => {
        await saveNotificationToDB(msg);
      
        if (msg.data?.type === 'incoming_call') {
          safeReset({
            name: 'UserIncomingCallPopup',
            params: {
              booking: safeJSON(msg.data.booking),
              astrologerData: safeJSON(msg.data.astrologerData),
              channelName: msg.data.channelName,
            },
          });
        }
      });
      

      // 🔹 BACKGROUND (app in memory)
      const unsubscribeOpened = messaging().onNotificationOpenedApp(async msg => {
        await saveNotificationToDB(msg);
      
        if (msg.data?.type === 'incoming_call') {
          safeReset({
            name: 'UserIncomingCallPopup',
            params: {
              booking: safeJSON(msg.data.booking),
              astrologerData: safeJSON(msg.data.astrologerData),
              channelName: msg.data.channelName,
            },
          });
        }
      });
      

      // 🔹 KILLED STATE
      messaging().getInitialNotification().then(async msg => {
        if (!msg || initialNotificationHandled.current) return;
      
        initialNotificationHandled.current = true;
        await saveNotificationToDB(msg);
      
        if (msg.data?.type === 'incoming_call') {
          safeReset({
            name: 'UserIncomingCallPopup',
            params: {
              booking: safeJSON(msg.data.booking),
              astrologerData: safeJSON(msg.data.astrologerData),
              channelName: msg.data.channelName,
            },
          });
        }
      });
      

      return () => {
        unsubscribe();
        unsubscribeOpened();
      };
    }, []);
    useEffect(() => {
      const interval = setInterval(() => {
        if (navigationRef.isReady()) {
          checkCustomerDetails();
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      let currentState = AppState.currentState;
    
      const subscription = AppState.addEventListener('change', nextState => {
        if (currentState.match(/inactive|background/) && nextState === 'active') {
          console.log('App resumed cleanly');
        }
        currentState = nextState;
      });
    
      return () => subscription.remove();
    }, []);

    return (
      <>
        <AppNavigator />
        <Toast />
      </>
    );
  }
