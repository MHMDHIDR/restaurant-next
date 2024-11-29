import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRQVhrLhEskLdyqD_5xY3oKh6tgjtqv-0",
  authDomain: "restaurant-nextjs-app.firebaseapp.com",
  projectId: "restaurant-nextjs-app",
  storageBucket: "restaurant-nextjs-app.firebasestorage.app",
  messagingSenderId: "172274867075",
  appId: "1:172274867075:web:11b4edec0a9c95e13bf4b6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
auth.useDeviceLanguage();
