import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import '../global.css';
import { Text, TextInput } from 'react-native';
import App from './App';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
      // Set Poppins as the default font for ALL Text and TextInput components
      const defaultTextStyle = { fontFamily: 'Poppins-Regular' };
      const oldTextRender = (Text as any).render;
      (Text as any).render = function (...args: any[]) {
        const origin = oldTextRender.call(this, ...args);
        return React.cloneElement(origin, {
          style: [defaultTextStyle, origin.props.style],
        });
      };
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

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <App />
    </ThemeProvider>
  );
}
