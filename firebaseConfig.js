import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as amplitude from '@amplitude/analytics-react-native';

amplitude.init('bd807e3906186c97dbf67b68ee246925');
// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyComESbHKEd4ZbMghb-r8FAOWRXWntKUVY',
  authDomain: 'savor-app-184a6.firebaseapp.com',
  projectId: 'savor-app-184a6',
  storageBucket: 'savor-app-184a6.appspot.com',
  appId: '1:288112913980:web:52cdf6a98628a2354b5d39',
  measurementId: 'G-RHZSMDGB2K',
};


// Initialize Firebase app if it hasn't been initialized yet
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing initialized app
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db, amplitude };
