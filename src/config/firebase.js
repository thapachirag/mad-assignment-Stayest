import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCN9PfHikNVM8EQzGWTPP4TX53fK8I1Mzo",
  authDomain: "staynest-36ad2.firebaseapp.com",
  projectId: "staynest-36ad2",
  storageBucket: "staynest-36ad2.firebasestorage.app",
  messagingSenderId: "121645379094",
  appId: "1:121645379094:web:b78c1a1bb08f4a611b8f37",
  measurementId: "G-4RRY4S7QJH",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/** @type {import("firebase/auth").Auth} */
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
