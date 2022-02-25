// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
} from 'firebase/auth';

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
initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
facebookProvider.addScope('public_profile');
facebookProvider.setCustomParameters({
  display: 'popup',
});

export const auth = getAuth();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const signInWithEmailPassword = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const createWithEmailPassword = (email, password) => createUserWithEmailAndPassword(auth, email, password);

export const signOutAuth = async () => {
  await signOut(auth);
};
