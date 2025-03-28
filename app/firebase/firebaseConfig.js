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

// make sure analytics is supported
// let analytics;
// isSupported().then((supported) => {
//   if (supported) {
//     analytics = getAnalytics(app);
//   }
// });

export default firebaseConfig;

export { auth };
// export { database, ref, set, get };