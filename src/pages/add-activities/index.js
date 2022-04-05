'use strict';

import { doc } from '../../firebase';
import { AuthenticatedUser } from '../../index';
import { categoriesCollection, getCategories } from '../../firebase/categories';
import { setLoader } from '../../utils';
import { placesCollection, getPlaces } from '../../firebase/places';
import { addNewActivity } from '../../firebase/activities';

export default async function AddActivities() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    if (window.myPlannerSnapshotUnsubscribe) {
      window.myPlannerSnapshotUnsubscribe();
      window.myPlannerSnapshotUnsubscribe = null;
    }

    async function loadCategories() {
      const categories = await getCategories();
      const categorySelect = document.getElementById('category');

      categories.forEach((category) => {
        categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
      });
    }

    async function loadPlaces() {
      const places = await getPlaces();
      const placeSelect = document.getElementById('place');

      places.forEach((place) => {
        placeSelect.innerHTML += `<option value="${place.id}">${place.name}</option>`;
      });
    }

    try {
      setLoader(true);
      await loadCategories();
      await loadPlaces();
      setLoader(false);
    } catch (error) {
      console.log(error);
      setLoader(false);
    }

    /**
     * handles the login form submit
     */
    activityForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();
        event.stopPropagation();

        activityForm.classList.add('was-validated');

        if (
          activityForm.checkValidity() &&
          activityName.value &&
          about.value &&
          imageUrl.value &&
          tags.value &&
          category.value &&
          place.value
        ) {
          const categories = [];

          Array.from(document.getElementsByName('category')[0].options).forEach((item) => {
            if (item.selected) {
              categories.push(doc(categoriesCollection, item.value));
            }
          });

          const activityData = {
            name: activityName.value,
            about: about.value,
            imageUrl: imageUrl.value,
            tags: tags.value.split(',').map((tag) => tag.toLowerCase().trim()),
            place: doc(placesCollection, place.value),
            category: categories,
          };

          try {
            setLoader(true);
            await addNewActivity(activityData);
            activityForm.reset();
            activityForm.classList.remove('was-validated');
            setLoader(false);
          } catch (error) {
            console.log(error);
            setLoader(false);
          }
        }
      },
      false
    );
  }
}
