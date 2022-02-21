// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCT9dQLmhlFNlwlxuePZZPwOZZoBPsmpbo',
  authDomain: 'adventurebc-1b6e0.firebaseapp.com',
  projectId: 'adventurebc-1b6e0',
  storageBucket: 'adventurebc-1b6e0.appspot.com',
  messagingSenderId: '688567435812',
  appId: '1:688567435812:web:f222c9da9fdb800b4aceb1',
  measurementId: 'G-XTDLK17ZRT',
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export const auth = getAuth();

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export const signOutAuth = async () => {
  await signOut(auth);
};
