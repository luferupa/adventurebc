import { db, collection, getDocs, getDoc } from '../firebase';

const categoriesCollection = collection(db, 'categories');

const getCategoriesSnapshot = async () => await getDocs(categoriesCollection);

const getCategories = async () => {
  const snapshot = await getCategoriesSnapshot();
  return snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    };
  });
};
/* 
const getCategory = async (activityId) => {
  const activityDocRef = doc(activitiesCollection, activityId);
  const snapshot = await getDoc(activityDocRef);
  const snapshotCategory = await getDoc(snapshot.data().category);
} */

const getCategoryByRef = async (categoryRef) => {
  const snapshotCategory = await getDoc(categoryRef);
  return snapshotCategory.data();
};

export { categoriesCollection, getCategoriesSnapshot, getCategories, getCategoryByRef };
