import { db, collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '../firebase';
import { getUserAdventures } from './users';

const usersCollection = collection(db, 'users');

const getAdventures = async () => {
  const snapshot = await getAdventuresSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getAdventure = async (adventureId, userId) => {
  const adventures = await getUserAdventures(userId);
  return adventures.filter( (adv) => adv.id == adventureId );
};

const addAdventure = async (adventure, userId) => {
  const userDocRef = doc(usersCollection, userId);
  const adventureDocRef = await updateDoc(userDocRef, {
    adventures: arrayUnion(adventure),
  });
};

const removeAdventure = async (adventure, userId) => {
  const userDocRef = doc(usersCollection, userId);
  const adventureDocRef = await updateDoc(userDocRef, {
    adventures: arrayRemove(adventure),
  });
};

const clearAdventures = async (userId) => {
  await setDoc(doc(usersCollection, userId), { adventures: [] }, { merge: true });
};

export { getAdventures, addAdventure, clearAdventures, getAdventure, removeAdventure };
