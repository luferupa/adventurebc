import { db, collection, getDocs, query, where } from '../firebase';

const activitiesCollection = collection(db, 'activities');

const getActivitiesSnapshot = async () => await getDocs(activitiesCollection);

const getActivities = async () => {
  const snapshot = await getActivitiesSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getActivitiesWhere = async (category, location) => {

    const q = query(activitiesCollection, where("name", "==", "Stanley Park Bike Tour"));
    const snapshot = await getDocs(q);
    /*snapshot.forEach((doc) =>{
        console.log(doc.id, " - ", doc.data);
    });*/
    return snapshot.docs.map((doc) => doc.data());
};

export { activitiesCollection, getActivitiesSnapshot, getActivities, getActivitiesWhere };