import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Redirect } from "expo-router";
import { useContext } from "react";
import { Drawer } from 'expo-router/drawer';
import { SessionContext } from "../../helpers/sessionContext";

export default function Layout() {

  const { sessionContext } = useContext(SessionContext);

  if (sessionContext.isLoggedIn != "true") { // Redirect the user to login page if not yet signed in
    return <Redirect href="../signin" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index" // This is the name of the page and must match the url from root
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
        name="public_profile"
        options={{
          drawerItemStyle: { display: 'none' }
        }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
