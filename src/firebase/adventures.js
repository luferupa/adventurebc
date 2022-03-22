import { db, collection, getDocs, doc, setDoc, updateDoc, arrayUnion } from '../firebase';

const adventuresCollection = collection(db, 'adventures');
const usersCollection = collection(db, 'users');

const getAdventuresSnapshot = async () => await getDocs(adventuresCollection);

const getAdventures = async () => {
  const snapshot = await getAdventuresSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const addAdventure = async (adventure, userId) => {
  const userDocRef = doc(usersCollection, userId);
  const adventureDocRef = await updateDoc(userDocRef, {
    adventures: arrayUnion(adventure),
  });
};

const clearAdventures = async (userId) => {
  await setDoc(doc(usersCollection, userId), { adventures: [] }, { merge: true });
};

export { adventuresCollection, getAdventuresSnapshot, getAdventures, addAdventure, clearAdventures };
