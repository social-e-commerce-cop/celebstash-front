import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import '../global.css';
import { Text, TextInput } from 'react-native';
import { Slot } from 'expo-router';

export { ErrorBoundary } from 'expo-router';

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
      try {
        const defaultTextStyle = { fontFamily: 'Poppins-Regular' };
        if ((Text as any)?.render) {
          const oldTextRender = (Text as any).render;
          (Text as any).render = function (...args: any[]) {
            const origin = oldTextRender.call(this, ...args);
            return React.cloneElement(origin, {
              style: [defaultTextStyle, origin.props.style],
            });
          };
        }
        if ((TextInput as any)?.render) {
          const oldTextInputRender = (TextInput as any).render;
          (TextInput as any).render = function (...args: any[]) {
            const origin = oldTextInputRender.call(this, ...args);
            return React.cloneElement(origin, {
              style: [defaultTextStyle, origin.props.style],
            });
          };
        }
      } catch (e) {
        console.warn('Could not override Text/TextInput render:', e);
      }
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}
