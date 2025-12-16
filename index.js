/**
 * @format
 */
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import notifee, { EventType } from '@notifee/react-native';

// 🔥 REQUIRED: HANDLE NOTIFICATION TAP WHEN APP IS KILLED
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (
    type === EventType.PRESS &&
    detail.notification?.data?.type === 'incoming_call'
  ) {
    // Store intent for navigation after app loads
    global.__INCOMING_CALL_DATA__ = detail.notification.data;
  }
});

AppRegistry.registerComponent(appName, () => App);
