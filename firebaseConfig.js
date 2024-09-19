import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyComESbHKEd4ZbMghb-r8FAOWRXWntKUVY',
  authDomain: 'savor-app-184a6.firebaseapp.com',
  projectId: 'savor-app-184a6',
  storageBucket: 'savor-app-184a6.appspot.com',
  messagingSenderId: '288112913980',
  appId: '1:288112913980:web:52cdf6a98628a2354b5d39',
  measurementId: 'G-RHZSMDGB2K',
};

// Initialize Firebase app if it hasn't been initialized yet
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // use existing initialized app
}

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(app);

export { auth, firestore };
