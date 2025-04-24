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
            headerStyle: {
              backgroundColor: '#219ebc',
            },
            headerTitleStyle: {
              color: '#FFF', 
            },
            headerTitleAlign: 'center',
          }}
        />
        <Drawer.Screen
          name="requestBoard"
          options={{
            drawerLabel: 'Requests',
            title: 'Request Board',
            headerStyle: {
              backgroundColor: '#219ebc',
            },
            headerTitleStyle: {
              color: '#FFF', 
            },
            headerTitleAlign: 'center',
          }}
        />
        <Drawer.Screen
          name="applianceBoard"
          options={{
            drawerLabel: 'Appliances',
            title: 'Appliance Board',
            headerStyle: {
              backgroundColor: '#219ebc',
            },
            headerTitleStyle: {
              color: '#FFF', 
            },
            headerTitleAlign: 'center',
          }}
        />
        <Drawer.Screen
          name="chatScreen"
          options={{
            drawerLabel: 'Messages',
            title: 'Messages',
            headerStyle: {
              backgroundColor: '#219ebc',
            },
            headerTitleStyle: {
              color: '#FFF', 
            },
            headerTitleAlign: 'center',
          }}
        />
        <Drawer.Screen
        name="public_profile"
        options={{
          title: "Public Profile",
          drawerItemStyle: { display: 'none' },
          headerStyle: {
            backgroundColor: '#219ebc',
          },
          headerTitleStyle: {
            color: '#FFF', 
          },
          headerTitleAlign: 'center',
        }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
