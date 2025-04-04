// app/ProfilePage.tsx
import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { saveInStore, removeFromStore } from '../helpers/keyfetch'; // Use this to access user info
import { useRouter } from 'expo-router';
import { SessionContext } from '@/helpers/sessionContext';
// import loginCheck from '@/helpers/loginCheck';

const ProfilePage: React.FC = () => {
  const router = useRouter();

  const { sessionContext, setContext }  = useContext(SessionContext);

  const [user, setUser ] = useState({
    created: 0,
    email: "",
    floor: 0,
    location: "",
    uid: "",
    username: "Loading...",
  });

  const logout = async() => {
    // console.log("logging out..");
    let res1 = await removeFromStore("sessionToken");
    let res2 = await removeFromStore("UID");
    
    if (!res1){
      saveInStore("sessionToken", "");
    }
    if (!res2) {
      saveInStore("UID", "");
    }

    setContext({
      isLoggedIn : "",
      UID : "",
      email : "",
      token : "",
    });
    // console.log("logged out");
  }

  const getResponse = async () => {
    // console.log("Loading profile page, requesting user info");
    // console.log("Token: ", sessionContext.sessionToken);
    
    const response = await fetch('http://localhost:3000/user/'+sessionContext?.UID, { // If running on an emulator, use 'http://{ip_address}:3000/request'
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'sessionToken': sessionContext.sessionToken,
      }
    });

    if (response.ok) {
        const returnedData = await response.json();
        // console.log("Returned data: ", returnedData);
        setUser(returnedData);
    } else {
      // If info not returned
      console.log("Response no good!");
    }
  }

  React.useEffect(() => {
      if (sessionContext.isLoggedIn != "true") {
        router.push("/" as any); // Redirect to login page if not signed in
      }
      // console.log("Session in profile page: ", sessionContext);
      // console.log("user: ", user);
      if (!user.created) { // Just check to see if values have been populated yet
        console.log("user data not yet fetched, grabbing it now");
        getResponse();
      }
    });

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg' }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{user?.username}</Text>
      <Text style={styles.bio}>
          {user?.email}
      </Text>
      {user.created ? <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text>Log Out</Text>
      </TouchableOpacity> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    top: "-30%",
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    top: "-30%",
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    top: "-30%",
  },
  logout: {
    backgroundColor: "red",
  },
});

export default ProfilePage;
