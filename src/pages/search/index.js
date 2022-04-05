'use strict';

import { AuthenticatedUser } from '../../index';
import { favouriteActiv, updateFav } from '../home/index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { getActivitiesWhere, getActivityPlace, activitiesCollection, getActivity, getActivityPlaceObject } from '../../firebase/activities';
import { addAdventure, getAdventure, removeAdventure } from '../../firebase/adventures';
import { db, doc } from '../../firebase';
import { getUserAdventures, addFavorite, removeFavorite } from '../../firebase/users';
import { setLoader } from '../../utils';

export default async function Search() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    setLoader(true);
    class Adventure {
      constructor(name, beginningDate, endDate, id, imageUrl) {
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
        this.imageUrl = imageUrl;
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
      assignRandomImage(){
        if(AuthenticatedUser.adventures.length < 3 ){
          this.imageUrl = adventureImgs[AuthenticatedUser.adventures.length];
        } else{
          this.imageUrl = adventureImgs[Math.floor(Math.random() * (adventureImgs.length+1))];
        }
      }
    }

    let adventureImgs = ["https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/adventures%2FADVENTURE1.png?alt=media&token=2ffc7ac3-0411-4b28-8216-031efae86847",
                    "https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/adventures%2FADVENTURE3.jpg?alt=media&token=5ec7050f-c139-4b73-bd81-50c68b8d9229",
                    "https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/adventures%2FADVENTURE2.png?alt=media&token=f0b6fdfa-634e-4c5e-b04b-5d2ae9db9dcc"];

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
      adventure = new Adventure(adventureName.value, null, null, undefined, undefined);
      adventure.assignRandomImage();
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
        adventureToChange.id,
        adventureToChange.imageUrl
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
        let additional = '';
        const exists = adventure.alreadyHas(activity.id);
        if (exists) {
          additional = 'added';
        }

        output += `<div class="activity ${additional}" id="fv-${activity.id}">
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

    setLoader(false);
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
      setLoader(true);
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

      setLoader(false);
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
        activity.addEventListener('click', function (event) {
          if (!event.target.classList.contains('fa-heart') && !event.target.parentNode.classList.contains('fa-heart')) {
            openActivity(this.id.substring(3))
          }
        });
      });
    }

    async function openActivity(id) {
      
      setLoader(true);
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

      let currentActivitiesID = document.querySelectorAll(`.activity[id*= "${id}" ]`);
 
      if(currentActivitiesID != null && currentActivitiesID != undefined && currentActivitiesID.length > 0){
        let dbCheck = true;
        for(let activity of currentActivitiesID){
          checkIfAdded(activity);
          addEventsAndClassesToCurrent(activity,addRemoveButton, dbCheck);
          dbCheck = false;
        }
        
      }

      modalWrapper.classList.add('showActivity');
      setLoader(false);
    }

    function addEventsAndClassesToCurrent(activity, addRemoveButton, dbCheck){
      addRemoveButton.addEventListener('click', () => {
        if (activity.classList.contains('added')) {
          if(dbCheck){
            adventure.removeActivity(doc(activitiesCollection, activity.id.substring(3)));
          } 
          
          activity.classList.remove('added');
          activity.querySelector('.fa-xmark').classList.remove('remove');
          addRemoveButton.innerHTML = `Add`;
        } else {
          if(dbCheck){
            adventure.addActivity(doc(activitiesCollection, activity.id.substring(3)));
          } 
          
          activity.classList.add('added');
          activity.querySelector('.fa-xmark').classList.add('remove');
          addRemoveButton.innerHTML = `Remove`;
        } 
        activity = ''
      });
    }

    function checkIfAdded(activity) {
      if (activity.classList.contains('added')) {
        addRemoveButton.innerHTML = `Remove`;
      } else {
        addRemoveButton.innerHTML = `Add`;
      }
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
      setLoader(true);
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
      setLoader(false);
    }

    async function refreshSuggestion(activityId){
      const element = document.querySelector('#'+activityId+' .heart');

      if(element != null && element != undefined){
        let added = false;
        for (let favorite of favouriteActiv) {
          if (favorite.id == activityId.substring(3)) {
            added = true;
            break;
          }
        }

        

        if(added){
          element.firstChild.classList.add('fa-regular');
          element.firstChild.classList.remove('fa-solid');
          element.firstChild.classList.remove('fav');
        }
      }

    }

    async function updateFavourites() {
      let content = '';
      
      for (let activity of favouriteActiv) {
        let additional = '';
        const exists = adventure.alreadyHas(activity.id);
        if (exists) {
          additional = 'added';
        }


        content += `<div class="activity ${additional}" id="fv-${activity.id}">
            <img src="${activity.imageUrl}" alt="Activity picture">
            <div class="heart"><span class="fa-solid fa-heart fav"></span></div>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div>`;
      }
      divFavourites.innerHTML = content;
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
      } 
      return output;
    }

  }
}
