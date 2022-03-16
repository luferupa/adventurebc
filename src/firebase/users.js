import { db, collection, getDocs, doc, updateDoc, getDoc, arrayUnion } from '../firebase';

const usersCollection = collection(db, "users");

const getUsersSnapshot = async () => await getDocs(usersCollection);

const getUsers = async () => {
  const snapshot = await getUsersSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getUserAdventures = async (userId) => {
    const userDocRef = doc(usersCollection,userId);
    const snapshot = await getDoc(userDocRef);
    return snapshot.data().adventures;
};

export { usersCollection, getUsersSnapshot, getUsers, getUserAdventures };