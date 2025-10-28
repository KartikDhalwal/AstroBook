import Toast from 'react-native-toast-message';

export const success_toast = (text) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: text,
    position: 'bottom',
    bottomOffset: 20,
    visibilityTime: 3000,
  });
};

export const warnign_toast = (text) => {
  Toast.show({
    type: 'error',
    text1: 'Warning',
    text2: text,
    position: 'top',
    topOffset: 20, // changed bottomOffset to topOffset for top position
    visibilityTime: 3000,
  });
};

export const info_toast = (text) => {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: text,
    position: 'bottom',
    bottomOffset: 20,
    visibilityTime: 3000,
  });
};
