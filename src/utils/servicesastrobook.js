import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import { requestNotifications } from 'react-native-permissions';

export const showToastMessageAstro = ({ message = '' }) => {
  try {
    if (Platform.OS === 'android') {
      // ToastAndroid.showWithGravityAndOffset(message, 200, 20, 25, 10);
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM, 
        50, 
        100 
      );
      
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

export const getFcmTokenAstro = async () => {
  console.log(Platform.OS,'Platform.OS')
  try {
    if (Platform.OS === 'ios') {
      // Ask for notification permissions
      await requestNotifications(['alert', 'sound', 'badge']);

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('Notification permission not granted on iOS.');
        return 'permission-denied-ios';
      }

      await messaging().registerDeviceForRemoteMessages();

      // Wait for APNs registration (sometimes takes a moment)
      let apnsToken;
      for (let i = 0; i < 5; i++) {
        apnsToken = await messaging().getAPNSToken();
        if (apnsToken) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      if (!apnsToken) {
        console.warn('APNs token not available.');
      } else {
        console.log('APNs Token:', apnsToken);
      }

      // Get FCM token
      const fcmToken = await messaging().getToken();
      console.log('FCM Token (iOS):', fcmToken);
      return fcmToken || 'default-token-ios';

    } else {
      // Android
      await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      console.log('FCM Token (Android):', fcmToken);
      return fcmToken || 'default-token-android';
    }
  } catch (e) {
    console.error('Error fetching FCM token:', e);
    return null;
  }
};

export const imagePicker = async ({ type }) => {
  try {
    const options = {
      mediaType: 'photo',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: false,
      selectionLimit: 5
    };

    const cameraData = async () => {
      try {
        const response = await ImagePicker.launchCamera({...options, quality: 0.2});
        if (response.didCancel) {
          console.log('user cancel');
          return null;
        } else if (response.errorCode) {
          console.log(response.errorCode);
          return null;
        } else if (response.errorMessage) {
          console.log(response.errorMessage);
          return null;
        } else {
          return response.assets;
        }
      } catch (e) {
        console.log(e)
        return null
      }

    }

    if (type == 'capture') {
      const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
      if (result) {
        return cameraData()
      } else {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          return cameraData()
        }
      }

    } else {
      const response = await ImagePicker.launchImageLibrary(options);
      if (response.didCancel) {
        console.log('user cancel');
        return null;
      } else if (response.errorCode) {
        console.log(response.errorCode);
        return null;
      } else if (response.errorMessage) {
        console.log(response.errorMessage);
        return null;
      } else {
        return response.assets;
      }
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

const inidanNumber = Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 2,
});
const inidanNumber0 = Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'symbol',
  minimumFractionDigits: 0,
});

export const showNumber0 = value => {
  return inidanNumber0.format(value);
};
export const showNumber = value => {
  return inidanNumber.format(value);
};

export const getForamtedDate = (date) => {
  try {
    // Get current date
    const currentDate = new Date();
    const tempDate = new Date(date)
    // Set current date to midnight
    currentDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0)

    // Get the difference in milliseconds between the current date and the argument date
    const timeDiff = currentDate.getTime() - date.getTime();

    // Calculate the number of milliseconds in a day
    const oneDay = 1000 * 60 * 60 * 24;

    // If the argument date is today, return "Today"
    if (timeDiff >= 0 && timeDiff < oneDay) {
      return `Today ${moment(tempDate).format('hh:mm A')}`;
    }
    // If the argument date is yesterday, return "Yesterday"
    else if (timeDiff >= oneDay && timeDiff < 2 * oneDay) {
      return `Yesterday ${moment(tempDate).format('hh:mm A')}`;
    }

    else return moment(tempDate).format('DD MMM YYYY hh:mm A');

  } catch (e) {
    console.log(e)
    return null
  }
}

export const secondsToHMSAstro = (duration) => {
  const seconds = parseFloat(duration).toFixed(0)
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const get_unique_id_astro_books = () => {
  try {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  } catch (e) {
    console.log(e);
  }
};





