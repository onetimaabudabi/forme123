import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1lFnZ-jACQe2VqHJZHX47mSfN25zk5A8",
  authDomain: "fitness-f5e26.firebaseapp.com",
  projectId: "fitness-f5e26",
  storageBucket: "fitness-f5e26.firebasestorage.app",
  messagingSenderId: "520603945927",
  appId: "1:520603945927:web:6c88dea32cd8cb223ea7e2",
  measurementId: "G-SKR3L9QKKW",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebase() {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _storage = getStorage(_app);
    if (typeof window !== "undefined") {
      setPersistence(_auth, browserLocalPersistence).catch(() => {});
    }
  }
  return { app: _app!, auth: _auth!, db: _db!, storage: _storage! };
}

export const getFbAuth = () => getFirebase().auth;
export const getDb = () => getFirebase().db;
export const getBucket = () => getFirebase().storage;