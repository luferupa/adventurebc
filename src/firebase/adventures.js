import { db, collection, getDocs, doc, updateDoc, addDoc, arrayUnion } from '../firebase';

const adventuresCollection = collection(db, 'adventures');
const usersCollection = collection(db, "users");

const getAdventuresSnapshot = async () => await getDocs(adventuresCollection);

const getAdventures = async () => {
  const snapshot = await getAdventuresSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const addAdventure = async (adventure) => {
    const userDocRef = doc(usersCollection, adventure.userId);
    const adventureDocRef = await updateDoc (userDocRef, {
        adventures: arrayUnion(adventure)
    });
}

export { adventuresCollection, getAdventuresSnapshot, getAdventures, addAdventure };