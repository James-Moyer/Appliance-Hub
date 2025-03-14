// Import the functions you need from the SDKs you need
import { getAuth, initializeApp } from "firebase/app";
import { getAuth as firebaseAuth, getIdToken } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8xESj7dd7a463EvvvuZdMuHtKoRGNkbw",
  authDomain: "appliance-hub.firebaseapp.com",
  projectId: "appliance-hub",
  storageBucket: "appliance-hub.firebasestorage.app",
  messagingSenderId: "432617318999",
  appId: "1:432617318999:web:bfdaefa21667cf57515112",
  measurementId: "G-70XK59DE0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = firebaseAuth(app);

export const getToken = async () => {
  const user = auth.currentUser;

  if (user) {
      try {
          // Force refresh the token to ensure it's fresh
          const token = await user.getIdToken(true);  // true forces a refresh

          console.log("Token retrieved:", token);

          return token;
      } catch (error) {
          console.error('Error fetching Firebase token:', error);
          return null;
      }
  } else {
      console.log('No user is logged in');
      return null;  
  }
};
// make sure analytics is supported
// let analytics;
// isSupported().then((supported) => {
//   if (supported) {
//     analytics = getAnalytics(app);
//   }
// });

export default firebaseConfig;
// export { database, ref, set, get };