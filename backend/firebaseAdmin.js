const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Load the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database(); // Realtime Database
const auth = admin.auth();   // Firebase Authentication

module.exports = { admin, db, auth };
