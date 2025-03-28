import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

async function saveInStore(key, value) {
    if (Platform.OS == 'web') {
        await AsyncStorage.setItem(key, value); // secure store not available on web so we use async store for testing
    } else {
        await SecureStore.setItemAsync(key, value.toString());
    }
}

async function getValue(key) {
    if (Platform.OS == 'web') {
        const result = await AsyncStorage.getItem(key);
    } else {
        const result = await SecureStore.getItemAsync(key);
    }

    return result;
}

export {saveInStore, getValue};