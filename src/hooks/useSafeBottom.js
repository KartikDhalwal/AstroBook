// hooks/useSafeBottom.js
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function useSafeBottom(min = 28) {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return Math.max(insets.bottom, min);
  }
  return insets.bottom;
}
