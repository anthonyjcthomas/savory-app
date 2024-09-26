import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: 'AIzaSyComESbHKEd4ZbMghb-r8FAOWRXWntKUVY',
    authDomain: 'savor-app-184a6.firebaseapp.com',
    projectId: 'savor-app-184a6',
    storageBucket: 'savor-app-184a6.appspot.com',
    appId: '1:288112913980:web:52cdf6a98628a2354b5d39',
    measurementId: 'G-RHZSMDGB2K',
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export { db, auth };
