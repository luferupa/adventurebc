import { db, collection, getDocs, doc, updateDoc, getDoc, arrayUnion } from '../firebase';
import { getActivity } from './activities';

const usersCollection = collection(db, "users");

const getUsersSnapshot = async () => await getDocs(usersCollection);

const getUsers = async () => {
  const snapshot = await getUsersSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

//not being used - pending to delete
const getUserAdventures = async (userId) => {
    const userDocRef = doc(usersCollection,userId);
    const snapshot = await getDoc(userDocRef);
    return snapshot.data().adventures;
};


const getUserFavorites = async (favourites) => {

    let favouriteActiv =  new Array();
    
    for(let favourite of favourites){
      const activity = await getActivity(favourite.id);
      favouriteActiv.push(activity);
    };

    return favouriteActiv;
    
};

export { usersCollection, getUsersSnapshot, getUsers, getUserAdventures, getUserFavorites };