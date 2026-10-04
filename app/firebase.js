import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHDXn-R6jgd4fBkgW4KzFp6p6Ym_yqQoI",
  authDomain: "yapedata.firebaseapp.com",
  projectId: "yapedata",
  storageBucket: "yapedata.firebasestorage.app",
  messagingSenderId: "228862586517",
  appId: "1:228862586517:web:4e2b2578fe0f826e32b59c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

export { auth, db, doc, setDoc, getDoc, updateDoc, provider, signInWithPopup, onAuthStateChanged };
