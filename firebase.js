import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "x",
  authDomain: "trilobyte-4467e.firebaseapp.com",
  projectId: "trilobyte-4467e",
  storageBucket: "trilobyte-4467e.firebasestorage.app",
  messagingSenderId: "274511927374",
  appId: "1:274511927374:web:ff12db499028d8250b4b1f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, collection, addDoc, getDocs, doc, setDoc, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut};
