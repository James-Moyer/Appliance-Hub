import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

async function saveInStore(key, value) {
    if (Platform.OS == 'web') {
        await AsyncStorage.setItem(key, value); // secure store not available on web so we use async store for testing- NOT SECURE
    } else {
        await SecureStore.setItemAsync(key, value.toString());
    }
}

async function getValue(key) {
    let result;
    if (Platform.OS == 'web') {
        result = await AsyncStorage.getItem(key); // Same deal down here
    } else {
        result = await SecureStore.getItemAsync(key);
    }

    return result;
}

export {saveInStore, getValue};