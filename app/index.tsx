import React from 'react';
import { Platform } from 'react-native';

// Polyfill codegenNativeComponent for web/SSR to avoid crashes in packages like react-native-screens
if (Platform.OS === 'web' || typeof window === 'undefined') {
  try {
    const RN = require('react-native');
    if (RN && !RN.codegenNativeComponent) {
      RN.codegenNativeComponent = () => () => null;
    }
  } catch (e) {
    // Ignore any error
  }
}

import App from './App';

export default function Index() {
  return <App />
}
