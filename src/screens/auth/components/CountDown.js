import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

const CountDown = ({ duration = 60, updateState }) => {
  const [timer, setTimer] = useState(duration);

  useEffect(() => {
    setTimer(duration);
    if (duration <= 0) return;

    const intervalId = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (updateState) updateState();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [duration, updateState]);

  return <Text>{timer}</Text>;
};

export default CountDown;
