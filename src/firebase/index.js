// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, query, where, arrayUnion, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyARfc7VDH2YJXp2xiJeZpAHGe7mOCA0Eaw',
  authDomain: 'adventurebc-bug-hunters.firebaseapp.com',
  projectId: 'adventurebc-bug-hunters',
  storageBucket: 'adventurebc-bug-hunters.appspot.com',
  messagingSenderId: '232203961391',
  appId: '1:232203961391:web:66d3f294d8f2f25dbe32da',
  measurementId: 'G-R3SDEC134C',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore(app);

const storage = getStorage();

export { auth, db, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where , storage, ref, uploadBytes, getDownloadURL, arrayUnion, Timestamp };
