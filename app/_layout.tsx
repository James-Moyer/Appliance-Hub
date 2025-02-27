import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="profile_page" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Profile Page',
            title: 'Profile Page',
          }}
        />
        <Drawer.Screen
          name="create_profile"
          options={{
            drawerLabel: '',
            title: 'Create Profile',
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen
          name="firebase/firebaseConfig" 
          options={{
            drawerLabel: '',
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen
          name="+not-found" 
          options={{
            drawerLabel: '',
            swipeEnabled: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
