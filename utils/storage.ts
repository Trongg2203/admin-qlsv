// utils/storage.ts
let AsyncStorage: any;

try {
  // Try to import the real AsyncStorage
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (error) {
  // Fallback for development
  console.warn("AsyncStorage not available, using memory fallback");
  const memoryStorage = new Map();
  AsyncStorage = {
    getItem: async (key: string) => memoryStorage.get(key) || null,
    setItem: async (key: string, value: string) =>
      memoryStorage.set(key, value),
    removeItem: async (key: string) => memoryStorage.delete(key),
  };
}

export { AsyncStorage };
