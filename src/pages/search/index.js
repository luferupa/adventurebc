'use strict';

import { AuthenticatedUser } from '../../index';
import { favouriteActiv, updateFav } from '../home/index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { getActivitiesWhere, getActivityPlace, activitiesCollection } from '../../firebase/activities';
import { addAdventure, getAdventure, removeAdventure } from '../../firebase/adventures';
import { db, doc } from '../../firebase';
import { getUserAdventures, getUserFavorites, addFavorite, removeFavorite } from '../../firebase/users';

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

    let categoryOptions, locationOptions, suggestions, filters;

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
        output += `<div class="activity" id="fv-${activity.id}">
                  <img src="${activity.imageUrl}" alt="Activity picture">
                  <div class="heart"><span class="fa-solid fa-heart fav"></span></div>`;
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
      assignEventToActivities('#favourites .activity');
      addFavoritesAction('#favourites .heart');
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
      filters = '';
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

      await updateResults();
      assignEventToActivities('#suggestions .activity');
      addFavoritesAction('#suggestions .heart');
    }

    async function updateResults() {
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

        output += `<div class="activity ${additional}" id="sg-${suggestion.id}">
            <img src="${suggestion.imageUrl}" alt="Activity picture">
            <div class="heart"><span class="fa-regular fa-heart`;
        for (let fav of favouriteActiv) {
          if (fav.id == suggestion.id) {
            output += ` fa-solid fav`;
            break;
          }
        }
        output += `"></span></div>`;
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

    function assignEventToActivities(selector) {
      const activities = document.querySelectorAll(selector);
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
        });
      });
    }

    function getRandomId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function addFavoritesAction(selector) {
      const act = document.querySelectorAll(selector);
      act.forEach((activityH) => {
        
        activityH.addEventListener('click', function () {
          modifyFavourites(activityH);
        });
      });
    }

    async function modifyFavourites(favouriteH) {
      let added = false;
      for (let favorite of favouriteActiv) {
        if (favorite.id == favouriteH.parentElement.id.substring(3)) {
          added = true;
          break;
        }
      }

      if (!added) {
        const activityRef = await addFavorite(AuthenticatedUser.id, favouriteH.parentElement.id.substring(3));
        AuthenticatedUser.favourites.push(activityRef);
        favouriteH.firstChild.classList.remove('fa-regular');
        favouriteH.firstChild.classList.add('fav');
        favouriteH.firstChild.classList.add('fa-solid');
      } else {
        const activityRef = await removeFavorite(AuthenticatedUser.id, favouriteH.parentElement.id.substring(3));
        AuthenticatedUser.favourites = AuthenticatedUser.favourites.filter(function (value) {
          return value.id != favouriteH.parentElement.id.substring(3);
        });
        favouriteH.firstChild.classList.add('fa-regular');
        favouriteH.firstChild.classList.remove('fa-solid');
        favouriteH.firstChild.classList.remove('fav');
      }
      
      if(favouriteH.parentElement.id.substring(0,2) == "fv"){
          await refreshSuggestion("sg-"+favouriteH.parentElement.id.substring(3));
      }
      await updateFav(AuthenticatedUser.favourites);
      await updateFavourites();
      
      assignEventToActivities('#favourites .heart');
      addFavoritesAction('#favourites .heart');
    }

    async function refreshSuggestion(activityId){
      let added = false;
      for (let favorite of favouriteActiv) {
        if (favorite.id == activityId.substring(3)) {
          added = true;
          break;
        }
      }

      const element = document.querySelector('#'+activityId+' .heart');

      if(added){
        element.firstChild.classList.add('fa-regular');
        element.firstChild.classList.remove('fa-solid');
        element.firstChild.classList.remove('fav');
      }

    }

    async function updateFavourites() {
      let content = '';
      
      for (let activity of favouriteActiv) {
        content += `<div class="activity" id="fv-${activity.id}">
            <img src="${activity.imageUrl}" alt="Activity picture">
            <div class="heart"><span class="fa-solid fa-heart fav"></span></div>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div>`;
      }
      divFavourites.innerHTML = content;
    }

  }
}
