'use strict';

import { AuthenticatedUser } from '../../index';
import { favouriteActiv } from '../home/index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { getActivitiesWhere, getActivityPlace, activitiesCollection, getActivity, getActivityPlaceObject } from '../../firebase/activities';
import { addAdventure, getAdventure, removeAdventure } from '../../firebase/adventures';
import { db, doc } from '../../firebase';
import { getUserAdventures } from '../../firebase/users';

export default async function Search() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    class Adventure {
      constructor(name, beginningDate, endDate, id) {
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

        this.id = id;

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
    const divFavourites = document.querySelector('#favourites .horizontal-scroll');

    let adventure;
    let adventureToChange;

    /* INITIAL LOAD - START */
    if (location.hash.split('/').length > 1 && location.hash.split('/')[1] != '') {
      await loadAdventure(location.hash.split('/')[1]);
    } else {
      adventure = new Adventure(adventureName.value, null, null, undefined);
    }

    const minStartDate = new Date();
    const offset = minStartDate.getTimezoneOffset() * 60000;
    beginningDate.setAttribute('min', new Date(minStartDate - offset).toISOString().split('T')[0]);
    endDate.setAttribute('min', new Date(minStartDate - offset).toISOString().split('T')[0]);

    async function loadAdventure(adventureId) {
      adventureToChange = (await getAdventure(adventureId, AuthenticatedUser.id))[0];
      adventure = new Adventure(
        adventureToChange.name,
        adventureToChange.beginningDate,
        adventureToChange.endDate,
        adventureToChange.id
      );
      adventure.userActivities = [...adventureToChange.userActivities];
      adventureName.value = adventure.name;
      beginningDate.value = adventure.beginningDate;
      endDate.value = adventure.endDate;
    }

    async function loadCategories() {
      const categories = await getCategories();

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

    async function loadFavourites() {
      let output = ``;
      for (let activity of favouriteActiv) {
        const exists = adventure.alreadyHas(activity.id);
        output += `<div class="activity" id="${activity.id}">
                  <img src="${activity.imageUrl}" alt="Activity picture">
                  <span class="fa-regular fa-heart"></span>`;
        if (exists) {
          output += `<span class="fa-solid fa-xmark remove"></span>`;
        } else {
          output += `<span class="fa-solid fa-xmark"></span>`;
        }
        output += `<h3>${activity.name}</h3>
                  <p>${await getActivityPlace(activity.id)}</p>
                  </div>`;
      }

      divFavourites.innerHTML = output;
      assignEventToSuggestions();
    }

    loadCategories();
    loadLocations();
    loadFavourites();

    if (favouriteActiv.length <= 0) {
      document.getElementById('favourites').style.display = 'none';
    }
    /* INITIAL LOAD - END */

    beginningDate.onchange = () => {
      endDate.value = '';
      endDate.setAttribute('min', beginningDate.value);
    };

    function updateCategory(category) {
      categorySelect.selectedIndex = category;
      let options = Array.from(categoryOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[category - 1].style.backgroundColor = '#D2E4D6';
    }

    function cleanCategories() {
      let options = Array.from(categoryOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
    }

    function updateLocation(location) {
      locationSelect.selectedIndex = location;
      let options = Array.from(locationOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[location - 1].style.backgroundColor = '#D2E4D6';
    }

    function cleanLocations() {
      let options = Array.from(locationOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
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

    searchFilters.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();

      document.getElementById('search').classList.add('hideBar');

      let category = document.getElementById('category-sel').value;
      let location = document.getElementById('location-sel').value;

      await searchActivity(category, location);

      document.getElementById('category-sel').value = 'Categories';
      document.getElementById('location-sel').value = 'Location';

      cleanCategories();
      cleanLocations();

      const collapsers = document.querySelectorAll('.collapse');
      collapsers.forEach((element) => {
        element.classList.remove('show');
      });
    });

    formAdventure.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();

      adventure.name = adventureName.value;
      adventure.beginningDate = beginningDate.value;
      adventure.endDate = endDate.value;
      if (adventure.id == undefined) adventure.id = getRandomId();
      if (adventureToChange != undefined) {
        await updateAdventure();
      } else {
        await addAdventure(adventure.toPlainObject(), AuthenticatedUser.id);
      }

      AuthenticatedUser.adventures = await getUserAdventures(AuthenticatedUser.id);

      location.hash = '#myPlanner/' + adventure.id;
    });

    async function updateAdventure() {
      await removeAdventure(adventureToChange, AuthenticatedUser.id);
      await addAdventure(adventure.toPlainObject(), AuthenticatedUser.id);
    }

    async function searchActivity(category, location) {
      suggestions = new Array();
      let filters = '';
      if (category != 'Categories' && location != 'Location') {
        suggestions = await getActivitiesWhere(category, location);
        filters += '(<b>Location:</b> ' + location + ', <b>Category:</b> ' + category + ') ';
      } else {
        if (location != 'Location') {
          suggestions = await getActivitiesWhere(null, location);
          filters += '(<b>Location:</b> ' + location + ') ';
        } else if (category != 'Categories') {
          suggestions = await getActivitiesWhere(category, null);
          filters += '(<b>Category:</b> ' + category + ') ';
        }
      }

      await updateResults(suggestions, filters);
      assignEventToSuggestions();
    }

    async function updateResults(suggestions, filters) {
      var output = '';
      if (suggestions != null && suggestions.length > 0) {
        output = `<h4>Search results <span>${filters}</span></h4>`;
      } else {
        output = '<h5>No results for your search. Try again with different filters.</h5>';
      }
      for (let suggestion of suggestions) {
        let additional = '';
        const exists = adventure.alreadyHas(suggestion.id);
        if (exists) {
          additional = 'added';
        }

        output += `<div class="activity ${additional}" id="${suggestion.id}">
            <img src="${suggestion.imageUrl}" alt="Activity picture">
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
          openActivity(this.id)

/*            if (this.classList.contains('added')) {
            adventure.removeActivity(doc(activitiesCollection, this.id));
            this.classList.remove('added');
            this.querySelector('.fa-xmark').classList.remove('remove');
          } else {
            adventure.addActivity(doc(activitiesCollection, this.id));
            this.classList.add('added');
            this.querySelector('.fa-xmark').classList.add('remove');
          } */ 
        });
      });
    }

    async function openActivity(id) {
      modalWrapper.classList.add('showActivity');

      let modalHeader = document.getElementById('modalHeader');
      let city = document.getElementById('city');
      let descriptionText = document.getElementById('descriptionText');
      let mapLongLat = document.getElementById('mapLongLat');
      
      let currentActivity = await getActivity(id);
      let cityDB = await getActivityPlaceObject(id);

      modalHeader.innerHTML = `<h2 id="title">${currentActivity.name}</h2><img src="${currentActivity.imageUrl}"><div id="closeButton"><span class="fa-solid fa-xmark"></span></div>`;
      city.innerHTML = cityDB.city;
      descriptionText.innerHTML = currentActivity.about;

      tipsAndRecommendation.innerHTML = getRecommendations(currentActivity)

      mapLongLat.innerHTML = `<iframe
      frameborder="0" 
      scrolling="no" 
      marginheight="0" 
      marginwidth="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${cityDB.coordinates._long - 0.01}%2C${
        cityDB.coordinates._lat - 0.01
      }%2C${cityDB.coordinates._long + 0.01}%2C${cityDB.coordinates._lat + 0.01}&amp;layer=mapnik&amp;marker=${
        cityDB.coordinates._lat
      }%2C${cityDB.coordinates._long}" 
      </iframe>`;

      const closeButton = document.getElementById('closeButton');

      closeButton.addEventListener('click', () => {
        modalWrapper.classList.remove('showActivity');
      });

      const addRemoveButton = document.getElementById('addRemoveButton');
      let currentActivityID = document.getElementById(id);
 
      checkIfAdded(currentActivityID)
  
      addRemoveButton.addEventListener('click', () => {
        if (currentActivityID.classList.contains('added')) {
          adventure.removeActivity(doc(activitiesCollection, id));
          currentActivityID.classList.remove('added');
          addRemoveButton.innerHTML = `Add`
        } else {
          adventure.addActivity(doc(activitiesCollection, id));
          currentActivityID.classList.add('added');
          addRemoveButton.innerHTML = `Remove`
        } 
        currentActivityID = ''
      })
    }

    function checkIfAdded(currentActivityID) {
      if (currentActivityID.classList.contains('added')) {
        addRemoveButton.innerHTML = `Remove`
      } else {
        addRemoveButton.innerHTML = `Add`
      }
    }

    function getRandomId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function getRecommendations(id) {
      let output = ``
      for (let i = 0; i < id.category.length; i++) {
        if (id.category[i].hasOwnProperty('tips') == true) { 
          for (let e = 0; e < id.category[i].tips.length; e++) {
            let preOutput = `
              <div class="tip">
                <img src="${id.category[i].tips[e].url}">
                <p>
                  ${id.category[i].tips[e].description}
                </p>
              </div>
              `;  
            output += preOutput;
          }
        }
      } return output;
    }

  }
}
