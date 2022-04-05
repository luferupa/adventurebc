'use strict';

import { AuthenticatedUser } from '../../index';
import { getUserFavorites, addFavorite, removeFavorite } from '../../firebase/users';

import { getActivityPlace, getActivitiesRandom, getActivity, getActivityPlaceObject } from '../../firebase/activities';
import { getFormattedDate, setLoader } from '../../utils/index.js';
import { getCategories, getCategoryByRef } from '../../firebase/categories';

export { updateFav, favouriteActiv };

async function updateFav(list){
  favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites);
}
let favouriteActiv = new Array();


export default async function Home() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    setLoader(true);
    //document.querySelector(".home-greeting p").innerHTML = "Hello, "+ AuthenticatedUser.username.split(" ")[0] + "!";
    const userAdventures = AuthenticatedUser.adventures;
    const myAdventuresDiv = document.querySelector('.my-adventures .horizontal-scroll');
    const randomActivities = await getActivitiesRandom();
    const exploreDiv = document.querySelector('.explore .horizontal-scroll');
    const favouritesDiv = document.querySelector('.favourites .horizontal-scroll');

    favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites);
    updateMyAdventures();
    await updateExplore();
    await updateFavourites();
    addFavoritesAction('.heart');
    setLoader(false);

    async function updateMyAdventures() {
      let output = ``;
      if(userAdventures != null && userAdventures != undefined && userAdventures.length>0){
        for (let userAdventure of userAdventures) {
          output += `<div><div class="activity block-narrow" onclick="location.hash = '#myPlanner/${userAdventure.id}'">`;
          if(userAdventure.imageUrl!=undefined && userAdventure.imageUrl!=null){
            output += `<img src="${userAdventure.imageUrl}" alt="Activity picture">`;
          }else{
            output += `<img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">`;
          }
          output += `<h3>${userAdventure.name}</h3>
              <p>${getFormattedDate(userAdventure.beginningDate)} - ${getFormattedDate(userAdventure.endDate)}</p>
              </div></div>`;
        }
        myAdventuresDiv.innerHTML = output;
        
      }else{
        output = `<div class="activity  block-narrow add-adventure"><span class="fa-solid fa-plus"></span></div>`;
        myAdventuresDiv.innerHTML = output;
        document.querySelector('.add-adventure').addEventListener('click', function () {
          location.hash = `#search`;
        });
      }

      
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
        await refreshSuggestion("ex-"+favouriteH.parentElement.id.substring(3));
      }

      favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites);
      await updateFavourites();
      addFavoritesAction('.favourites .heart');
      setLoader(false);
    }

    async function updateExplore() {
      let content = '';

      for (let activity of randomActivities) {
        content += `<div><div class="activity block-wide" id="ex-${activity.id}">
            <img src="${activity.imageUrl}" alt="Activity picture">
            <div class="heart"><span class="fa-regular fa-heart`;
        for (let fav of favouriteActiv) {
          if (fav.id == activity.id) {
            content += ` fa-solid fav`;
            break;
          }
        }
        content += `"></span></div>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
      }
      exploreDiv.innerHTML = content;
    }

    async function updateFavourites() {
      let content = '';
      
      if(favouriteActiv != null && favouriteActiv != undefined && favouriteActiv.length > 0 ){
        document.querySelector('.favourites').style.display = 'block';
        for (let activity of favouriteActiv) {
          content += `<div><div class="activity block-wide" id="fv-${activity.id}">
              <img src="${activity.imageUrl}" alt="Activity picture">
              <div class="heart"><span class="fa-solid fa-heart fav"></span></div>
              <h3>${activity.name}</h3>
              <p>${await getActivityPlace(activity.id)}</p>
              </div></div>`;
        }
        favouritesDiv.innerHTML = content;
      }else{
        document.querySelector('.favourites').style.display = 'none';
      }
      
    }

    const exploreActivities = document.getElementById('exploreID');
    const favouriteActivities = document.getElementById('favouritesID');
    const modalWrapper = document.getElementById('modalWrapper');

    exploreActivities.onclick = function (event) {
      if (!event.target.classList.contains('fa-heart') && !event.target.parentNode.classList.contains('fa-heart')) {
        let target = event.target.parentNode;
        let clickedActivity = document.getElementById(target.id);
        openActivity(clickedActivity.id.substring(3));
      }
    };

    favouriteActivities.onclick = function (event) {
      if (!event.target.classList.contains('fa-heart') && !event.target.parentNode.classList.contains('fa-heart')) {
        let target = event.target.parentNode;
        let clickedActivity = document.getElementById(target.id);
        openActivity(clickedActivity.id.substring(3));
      }
    };

    async function openActivity(id) {
      setLoader(true);

      let modalHeader = document.getElementById('modalHeader');
      let city = document.getElementById('city');
      let descriptionText = document.getElementById('descriptionText');
      let mapLongLat = document.getElementById('mapLongLat');
      let tipsAndRecommendation = document.getElementById('tipsAndRecommendation');

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

      modalWrapper.classList.add('showActivity');
      setLoader(false);
    }

    function addFavoritesAction(selector) {
      const act = document.querySelectorAll(selector);
      act.forEach((activityH) => {
        
        activityH.addEventListener('click', function () {
          modifyFavourites(activityH);
        });
      });
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
