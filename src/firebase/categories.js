import { db, collection, getDocs } from '../firebase';

const categoriesCollection = collection(db, 'categories');

const getCategoriesSnapshot = async () => await getDocs(categoriesCollection);

const getCategories = async () => {
  const snapshot = await getCategoriesSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

export { categoriesCollection, getCategoriesSnapshot, getCategories };
