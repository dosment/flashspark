
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-8091148765-b731e',
  appId: '1:209679517393:web:74ad4d01ed6ce2a3c4e7f0',
  storageBucket: 'studio-8091148765-b731e.firebasestorage.app',
  apiKey: 'AIzaSyCqJtom0qLg68SDeqiv3nnyiRjJQcs3_NA',
  authDomain: 'studio-8091148765-b731e.firebaseapp.com',
  messagingSenderId: '209679517393',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
