require('dotenv').config();
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, update, remove } = require('firebase/database');
const { getAnalytics, isSupported } = require("firebase/analytics");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "appliance-hub.firebaseapp.com",
  projectId: "appliance-hub",
  storageBucket: "appliance-hub.firebasestorage.app",
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEAS_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// make sure analytics is supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

module.exports = firebaseConfig;
module.exports = { database, ref, set, get, update, remove };