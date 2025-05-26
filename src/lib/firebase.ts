import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "greenhouse-gh.firebaseapp.com",
  projectId: "greenhouse-gh",
  storageBucket: "greenhouse-gh.firebasestorage.app",
  messagingSenderId: "525053763203",
  appId: "1:525053763203:web:0d9635c11ba6c8effb85b6",
  measurementId: "G-1GW3W0FNVS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;