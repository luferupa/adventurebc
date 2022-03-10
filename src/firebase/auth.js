import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
} from 'firebase/auth';

import { db, collection, auth, getDoc, doc, setDoc, storage, ref, uploadBytes, getDownloadURL } from '.';

const usersCollection = collection(db, 'users');
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

facebookProvider.addScope('public_profile');

facebookProvider.setCustomParameters({
  display: 'popup',
});

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);

export const signInWithEmailPassword = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const createWithEmailPassword = (email, password) => createUserWithEmailAndPassword(auth, email, password);

export const signOutAuth = async () => {
  await signOut(auth);
};

/**
 * helper method to create new user based on different auth mechanisms
 * @param {Object} userInfo the user info object
 */
export const createUserProfileDocument = async (userInfo) => {
  if (!userInfo) return;

  try {
    const userSnapshot = await getDoc(doc(usersCollection, userInfo.uid));

    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL } = userInfo;
      const createdAt = new Date();

      const newUser = {
        username: displayName ? displayName : 'Username',
        email,
        createdAt,
        avatarUrl: photoURL ? photoURL : 'https://www.codewigs.com/static/img/profile/default/avatar-2.png',
      };

      await setDoc(doc(usersCollection, userSnapshot.id), newUser);

      return { id: userSnapshot.id, ...newUser };
    } else {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data(),
      };
    }
  } catch (error) {
    return error;
  }
};

/**
 * helper method to create new user based on different auth mechanisms
 * @param {Object} userInfo the user info object
 */
export const changeUserPicture = async (file, currentUser) => {
  const storageRef = ref(storage, `profile-pictures/${currentUser.id}`);

  try {
    await uploadBytes(storageRef, file);

    const newAvatarUrl = await getDownloadURL(storageRef);

    await setDoc(doc(usersCollection, currentUser.id), { avatarUrl: newAvatarUrl }, { merge: true });

    return newAvatarUrl;
  } catch (error) {
    console.log(error);
  }
};
