import { db, collection, getDocs, getDoc, query } from '../firebase';
import { getCityName } from './cities';

const placesCollection = collection(db, 'places');

const getPlacesSnapshot = async () => await getDocs(placesCollection);

const getPlaces = async () => {
  const snapshot = await getPlacesSnapshot();
  return snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    };
  });
};

const getPlaceCity = async (placeRef) => {
  const snapshotPlace = await getDoc(placeRef);
  const cityRef = snapshotPlace.data().city;

  return getCityName(cityRef);
};

export { placesCollection, getPlacesSnapshot, getPlaces, getPlaceCity };
