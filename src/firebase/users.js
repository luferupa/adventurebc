import { db, collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from '../firebase';
import { getActivity, getActivityRef } from './activities';

const usersCollection = collection(db, 'users');

const getUsersSnapshot = async () => await getDocs(usersCollection);

const getUsers = async () => {
  const snapshot = await getUsersSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getUser = async (userId) => {
  const userDocRef = doc(usersCollection, userId);
  const snapshot = await getDoc(userDocRef);
  return snapshot.data().adventures;
};

//not being used - pending to delete
const getUserAdventures = async (userId) => {
  const userDocRef = doc(usersCollection, userId);
  return await getDoc(userDocRef);
};


const getUserFavorites = async (favourites) => {

    let favouriteActiv =  new Array();
    
    for(let favourite of favourites){
      const activity = await getActivity(favourite.id);
      favouriteActiv.push(activity);
    };

    return favouriteActiv;
    
};

const addFavorite = async (userId,favoriteId) => {
  const activityRef= await getActivityRef(favoriteId);
  const userDocRef = doc(usersCollection, userId);
  const adventureDocRef = await updateDoc(userDocRef, {
    favourites: arrayUnion(activityRef),
  });

  return activityRef;//await getUser(userId);
}

export { usersCollection, getUsersSnapshot, getUsers, getUserAdventures, getUserFavorites, addFavorite };
