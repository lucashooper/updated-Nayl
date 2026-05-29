import { NativeModules } from 'react-native';

// Try to load the native module, but provide a fallback for Expo Go
const ExpoHapticTypewriterModule = NativeModules.ExpoHapticTypewriter || {
  startTypewriterHaptics: async () => {
    console.log('[ExpoHapticTypewriter] Native module not available (running in Expo Go)');
  },
  stopTypewriterHaptics: () => {
    console.log('[ExpoHapticTypewriter] Native module not available (running in Expo Go)');
  },
  tickCharacter: () => {
    // Silent fallback - no logging spam
  }
};

export default ExpoHapticTypewriterModule;
