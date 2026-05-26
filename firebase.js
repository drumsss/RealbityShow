import { initializeApp } from "firebase/app";

import {
  getFirestore
} from "firebase/firestore";

import {
  getStorage
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_CNQ5KZqv3agLcVqWBH1jOnXrMJ5U8BU",
  authDomain: "reality-show-fa79c.firebaseapp.com",
  projectId: "reality-show-fa79c",
  storageBucket: "reality-show-fa79c.firebasestorage.app",
  messagingSenderId: "454432745080",
  appId: "1:454432745080:web:188d9e9efe9ff7a2c56f8d"
};

const app = initializeApp(firebaseConfig);

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);