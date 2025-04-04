import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { SessionContext } from "../helpers/sessionContext";
import { useState } from "react";

export default function Layout() {

  const [sessionContext, setContext] = useState({
    IsLoggedIn : "false",
    UID : "",
    email: "",
    token : "",
  });

  return (
    <SessionContext.Provider value = {{ sessionContext, setContext }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer>
          <Drawer.Screen
            name="index" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: 'Home',
              title: 'Home',
            }}
          />
          <Drawer.Screen
            name="profile_page"
            options={{
              drawerLabel: 'Profile Page',
              title: 'Profile Page',
            }}
          />
          <Drawer.Screen
            name="requestBoard"
            options={{
              drawerLabel: 'Requests',
              title: 'Request Board',
            }}
          />
          <Drawer.Screen
            name="applianceBoard"
            options={{
              drawerLabel: 'Appliances',
              title: 'Appliance Board'
            }}
          />
          <Drawer.Screen
            name="chatScreen"
            options={{
              drawerLabel: 'Messages',
              title: 'Messages'
            }}
          />
          <Drawer.Screen
            name="create_profile"
            options={{
              drawerItemStyle: { display: 'none' }
            }}
          />
          <Drawer.Screen
            name="firebase/firebaseConfig" 
            options={{
              drawerItemStyle: { display: 'none' }
            }}
          />
          <Drawer.Screen
            name="+not-found" 
            options={{
              drawerItemStyle: { display: 'none' }
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </SessionContext.Provider>
  );
}
