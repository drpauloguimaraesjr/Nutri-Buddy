const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    const config = {
      credential: admin.credential.cert(serviceAccount),
      databaseId: 'nutribuddy' // Usar banco em southamerica-east1
    };

    // Só adiciona databaseURL se Realtime Database estiver habilitado
    if (process.env.FIREBASE_DATABASE_URL) {
      config.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }

    firebaseApp = admin.initializeApp(config);

    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

// Get Firestore instance
const db = admin.firestore();

// Get Realtime Database instance (if needed)
// Only initialize if databaseURL is configured
const database = process.env.FIREBASE_DATABASE_URL ? admin.database() : null;

// Firebase Auth instance
const auth = admin.auth();

module.exports = {
  admin,
  db,
  database,
  auth,
  firebaseApp
};

