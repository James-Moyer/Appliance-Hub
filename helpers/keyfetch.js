import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

async function saveInStore(key, value) {
    try {
        if (Platform.OS == 'web') {
            // THIS TRIED TO PRINT THE PAGE SO I DONT THINK WE SHOULD USE IT- just gonna do print statements
            // await AsyncStorage.setItem(key, value); // secure store not available on web so we use async store for testing- NOT SECURE
            console.log("saved a key! ", key, " to ", value);
        } else {
            await SecureStore.setItemAsync(key, value.toString());
        }
        return true;
    } catch {
        print("Failed to set key");
        return false;
    }
}

async function getFromStore(key) {
    let result;
    try {
        if (Platform.OS == 'web') {
            // result = await AsyncStorage.getItem(key);
            console.log("got a key! ", key);
        } else {
            result = await SecureStore.getItemAsync(key);
        }
        if (result == null) result = false;
    } catch {
        print("Failed to get value");
        result = false;
    }
    
    return result;
}

async function removeFromStore(key) {
    try {
        if (Platform.OS == 'web') {
            // await AsyncStorage.deleteItem(key);
            console.log("deleted a key! ", key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
        return true;
    } catch {
        print("Failed to delete");
        return false;
    }
}

export {saveInStore, getFromStore, removeFromStore };