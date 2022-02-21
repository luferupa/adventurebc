// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

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

export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

export const auth = getAuth();

export const signInWithGoogle = () => signInWithPopup(auth, provider);

export const signOutAuth = async () => {
  await signOut(auth);
};
