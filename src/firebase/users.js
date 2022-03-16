import { db, collection, getDocs, doc, updateDoc, getDoc, arrayUnion } from '../firebase';
import { getActivity } from './activities';

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

const getUserFavorites = async (userId) => {
    const userDocRef = doc(usersCollection,userId);
    const snapshot = await getDoc(userDocRef);
    const favourites = [];
    snapshot.data().favourites.forEach(async (favourite) => {
        const activityDocRef = await getActivity(favourite.id);
        favourites.push(activityDocRef);
    });
    return favourites;
    
};

export { usersCollection, getUsersSnapshot, getUsers, getUserAdventures, getUserFavorites };