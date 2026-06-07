import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_CNQ5KZqv3agLcVqWBH1jOnXrMJ5U8BU",
  authDomain: "reality-show-fa79c.firebaseapp.com",
  projectId: "reality-show-fa79c",
  storageBucket: "reality-show-fa79c.appspot.com",
  messagingSenderId: "454432745080",
  appId: "1:454432745080:web:188d9e9efe9ff7a2c56f8d"
};

// 🔥 FIX fondamentale (evita doppia init)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);