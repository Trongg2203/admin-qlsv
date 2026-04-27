// utils/webStorage.ts
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// Web storage wrapper
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};

let AsyncStorage: any;

if (isWeb) {
  AsyncStorage = webStorage;
} else {
  // Mobile: sử dụng native AsyncStorage
  const NativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
  AsyncStorage = NativeAsyncStorage;
}

export default AsyncStorage;