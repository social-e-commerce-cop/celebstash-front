import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import '../global.css';
import App from './App';

export default function RootLayout() {
  const [loaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (loaded) {
      // Set Poppins as the default font for all Text components
      const defaultTextStyle = { fontFamily: 'Poppins-Regular' };

      const oldTextRender = (Text as any).render;
      (Text as any).render = function (...args: any[]) {
        const origin = oldTextRender.call(this, ...args);

        return React.cloneElement(origin, {
          style: [defaultTextStyle, origin.props.style],
        });
      };

      // Set Poppins as the default font for all TextInput components
      const oldTextInputRender = (TextInput as any).render;
      (TextInput as any).render = function (...args: any[]) {
        const origin = oldTextInputRender.call(this, ...args);

        return React.cloneElement(origin, {
          style: [defaultTextStyle, origin.props.style],
        });
      };

      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <App />;
}

