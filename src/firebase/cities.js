import { db, collection, getDocs, getDoc } from '../firebase';

const citiesCollection = collection(db, 'cities');

const getCitiesSnapshot = async () => await getDocs(citiesCollection);

const getCities = async () => {
  const snapshot = await getCitiesSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getCityName = async (cityRef) => {
  const snapshotCity = await getDoc(cityRef);
  return snapshotCity.data().name;
};

export { citiesCollection, getCitiesSnapshot, getCities, getCityName };
