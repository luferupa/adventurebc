import { db, collection, getDocs } from '../firebase';

const citiesCollection = collection(db, 'cities');

const getCitiesSnapshot = async () => await getDocs(citiesCollection);

const getCities = async () => {
  const snapshot = await getCitiesSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

export { citiesCollection, getCitiesSnapshot, getCities };
