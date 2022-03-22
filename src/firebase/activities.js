import { db, collection, doc, getDocs, getDoc, query, where, limit, orderBy } from '../firebase';
import { getPlaceCity } from './places';

const activitiesCollection = collection(db, 'activities');

const getActivitiesSnapshot = async () => await getDocs(activitiesCollection);

const getActivities = async () => {
  const snapshot = await getActivitiesSnapshot();
  return snapshot.docs.map((doc) => doc.data());
};

const getActivitiesRandom = async () => {
    const queryRandom = query(activitiesCollection/*, where("random", "<=", random) , orderBy("random")*/, limit(6));
    const snapshot = await getDocs(queryRandom);
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
};

const getActivitiesWhere = async (category, location) => {

    let qActivities, qPlaces, categoryDocRef, locationDocRef = "";
    const placesRef = [];
    
    if(category != null){
        categoryDocRef = doc(collection(db, "categories"),category.toLowerCase().replaceAll(" ","_"));
    }

    if(location != null){
        locationDocRef = doc(collection(db, "cities"),location.toLowerCase().replaceAll(" ","_"));

        qPlaces = query(collection(db, "places"), where("city", "==", locationDocRef));
        const snapshotPlaces = await getDocs(qPlaces);
        
        snapshotPlaces.forEach( (place) => placesRef.push(doc(collection(db, "places"),place.id)));
    }

    if(category != null && location != null){
        qActivities = query(activitiesCollection, where("category", "array-contains", categoryDocRef),
        where("place", "in", placesRef));
    }else if(category == null){
        qActivities = query(activitiesCollection, where("place", "in", placesRef));
    }else if(location == null){
        qActivities = query(activitiesCollection, where("category", "array-contains", categoryDocRef));
    }

    const snapshot = await getDocs(qActivities);
    
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
};

const getActivityPlace = async (activityId) => {
    const activityDocRef = doc(activitiesCollection,activityId);
    const snapshot = await getDoc(activityDocRef);
    return getPlaceCity(snapshot.data().place);
};

const getActivity = async (activityId) => {
    const activityDocRef = doc(activitiesCollection,activityId);
    const snapshot = await getDoc(activityDocRef);
    return {id: activityId, ...snapshot.data()};
};

export { activitiesCollection, getActivitiesSnapshot, getActivities, getActivitiesWhere, getActivityPlace, getActivitiesRandom, getActivity };