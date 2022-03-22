'use strict';

import { AuthenticatedUser } from '../../index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { getActivitiesWhere, getActivityPlace, activitiesCollection } from '../../firebase/activities';
import { addAdventure } from '../../firebase/adventures';
import { db, doc } from '../../firebase';

export default function Search() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    class Adventure {
      constructor(name, beginningDate, endDate) {
        this.name = name;
        if (beginningDate != null) {
          this.beginningDate = beginningDate;
        } else {
          this.beginningDate = null;
        }

        if (endDate != null) {
          this.endDate = endDate;
        } else {
          this.endDate = null;
        }

        this.userActivities = new Array();
      }
      addActivity(activityRef) {
        this.userActivities.push({
          activityId: activityRef,
          daySlot: '',
          dayOrder: 0,
        });
      }
      removeActivity(activityRef) {
        this.userActivities = this.userActivities.filter(function (value) {
          return value.activityId.id != activityRef.id;
        });
      }
      alreadyHas(activityId) {
        const result = this.userActivities.filter(function (value) {
          return value.activityId.id == activityId;
        });
        return result.length > 0;
      }
      toPlainObject() {
        const clone = { ...this };
        return clone;
      }
    }

    let categoryOptions, locationOptions, suggestions;

    const categorySelect = document.getElementById('category-sel');
    const locationSelect = document.getElementById('location-sel');
    const adventureName = document.getElementById('adventure-name');
    const beginningDate = document.getElementById('from-date');
    const endDate = document.getElementById('to-date');
    const divResults = document.getElementById('suggestions');

    let adventure = new Adventure(adventureName.value, null, null);

    /* INITIAL LOAD - START */
    async function loadCategories() {
      const categories = await getCategories();
      console.log(categories);

      let pos = 1;

      categories.forEach((category) => {
        categorySelect.innerHTML += `<option value="${category.name}" hidden>${category.name}</option>`;
        document.getElementById(
          'options-categ'
        ).innerHTML += `<option class="categoryOption" value="${pos}">${category.name}</option>`;
        pos++;
      });
      document.getElementById('options-categ').style.maxHeight = '8rem';

      categoryOptions = document.querySelectorAll('.categoryOption');

      categoryOptions.forEach((option) => {
        option.addEventListener('click', function (event) {
          updateCategory(option.value);
        });
      });
    }

    async function loadLocations() {
      const cities = await getCities();
      console.log(cities);

      let pos = 1;

      cities.forEach((city) => {
        locationSelect.innerHTML += `<option value="${city.name}" hidden>${city.name}</option>`;
        document.getElementById(
          'options-loc'
        ).innerHTML += `<option class="locationOption" value="${pos}">${city.name}</option>`;
        pos++;
      });
      document.getElementById('options-loc').style.maxHeight = '8rem';

      locationOptions = document.querySelectorAll('.locationOption');

      locationOptions.forEach((option) => {
        option.addEventListener('click', function (event) {
          updateLocation(option.value);
        });
      });
    }

    loadCategories();
    loadLocations();
    /* INITIAL LOAD - END */

    function updateCategory(category) {
      categorySelect.selectedIndex = category;
      let options = Array.from(categoryOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[category - 1].style.backgroundColor = '#D2E4D6';
    }

    function updateLocation(location) {
      locationSelect.selectedIndex = location;
      let options = Array.from(locationOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[location - 1].style.backgroundColor = '#D2E4D6';
    }

    editButton.addEventListener('click', function () {
      adventureName.readOnly = false;
      adventureName.focus();
    });

    adventureName.addEventListener('focusout', function () {
      adventureName.readOnly = true;
    });

    document.getElementById('open-search').addEventListener('click', function () {
      document.getElementById('search').classList.remove('hideBar');
    });

    document.getElementById('close-search').addEventListener('click', function () {
      document.getElementById('search').classList.add('hideBar');
    });

    searchFilters.addEventListener('submit', function (event) {
      event.preventDefault();
      document.getElementById('search').classList.add('hideBar');

      let category = document.getElementById('category-sel').value;
      let location = document.getElementById('location-sel').value;

      searchActivity(category, location);
    });

    plannerBtn.addEventListener('click', async function () {
      adventure.name = adventureName.value;
      adventure.beginningDate = beginningDate.value;
      adventure.endDate = endDate.value;
      adventure.id = getRandomId();
      console.log(adventure.toPlainObject());
      await addAdventure(adventure.toPlainObject(), AuthenticatedUser.id);
      location.hash = '#myPlanner/' + adventure.id;
    });

    async function searchActivity(category, location) {
      suggestions = new Array();

      if (category == 'Categories') {
        suggestions = await getActivitiesWhere(null, location);
      } else if (location == 'Location') {
        suggestions = await getActivitiesWhere(category, null);
      } else {
        suggestions = await getActivitiesWhere(category, location);
      }

      await updateResults(suggestions);
      assignEventToSuggestions();
    }

    async function updateResults(suggestions) {
      var output = '';
      for (let suggestion of suggestions) {
        let additional = '';
        const exists = adventure.alreadyHas(suggestion.id);
        if (exists) {
          additional = 'added';
        }

        output += `<div class="activity ${additional}" id="${suggestion.id}">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>`;
        if (exists) {
          output += `<span class="fa-solid fa-xmark remove"></span>`;
        } else {
          output += `<span class="fa-solid fa-xmark"></span>`;
        }

        output += `<h3>${suggestion.name}</h3>
            <p>${await getActivityPlace(suggestion.id)}</p>
            </div>`;
      }
      divResults.innerHTML = output;
    }

    function assignEventToSuggestions() {
      const activities = document.querySelectorAll('.activity');
      activities.forEach((activity) => {
        activity.addEventListener('click', function () {
          if (this.classList.contains('added')) {
            adventure.removeActivity(doc(activitiesCollection, this.id));
            this.classList.remove('added');
            this.querySelector('.fa-xmark').classList.remove('remove');
          } else {
            adventure.addActivity(doc(activitiesCollection, this.id));
            this.classList.add('added');
            this.querySelector('.fa-xmark').classList.add('remove');
          }
          console.log(adventure);
        });
      });
    }

    function getRandomId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  }
}
