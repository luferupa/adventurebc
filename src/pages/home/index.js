'use strict';

import { AuthenticatedUser } from '../../index';
import { getUserFavorites, addFavorite, removeFavorite } from '../../firebase/users';

import { getActivityPlace, getActivitiesRandom, getActivity, getActivityPlaceObject } from '../../firebase/activities';
import { getFormattedDate, setLoader } from '../../utils/index.js';
import { getCategories } from '../../firebase/categories';
export let favouriteActiv = new Array();

export default async function Home() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    setLoader(true);
    const userAdventures = AuthenticatedUser.adventures;
    const myAdventuresDiv = document.querySelector('.my-adventures .horizontal-scroll');
    const randomActivities = await getActivitiesRandom();
    const exploreDiv = document.querySelector('.explore .horizontal-scroll');
    const favouritesDiv = document.querySelector('.favourites .horizontal-scroll');

    favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites);
    updateMyAdventures();
    await updateExplore();
    await updateFavourites();
    addFavoritesAction();
    setLoader(false);

    async function updateMyAdventures() {
      myAdventuresDiv.innerHTML = ``;
      for (let userAdventure of userAdventures) {
        myAdventuresDiv.innerHTML += `<div><div class="activity block-narrow" onclick="location.hash = '#myPlanner/${
          userAdventure.id
        }'">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <h3>${userAdventure.name}</h3>
            <p>${getFormattedDate(userAdventure.beginningDate)} - ${getFormattedDate(userAdventure.endDate)}</p>
            </div></div>`;
      }
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
        favouriteH.classList.remove('fa-regular');
        favouriteH.classList.add('fav');
        favouriteH.classList.add('fa-solid');
      } else {
        const activityRef = await removeFavorite(AuthenticatedUser.id, favouriteH.parentElement.id.substring(3));
        AuthenticatedUser.favourites = AuthenticatedUser.favourites.filter(function (value) {
          return value.id != favouriteH.parentElement.id.substring(3);
        });
        favouriteH.classList.add('fa-regular');
        favouriteH.classList.remove('fa-solid');
        favouriteH.classList.remove('fav');
      }

      favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites);
      updateFavourites();
      addFavoritesAction();
    }

    async function updateExplore() {
      let content = '';

      for (let activity of randomActivities) {
        content += `<div><div class="activity block-wide" id="ex-${activity.id}">
            <img src="${activity.imageUrl}" alt="Activity picture">
            <span class="fa-regular fa-heart`;
        for (let fav of favouriteActiv) {
          if (fav.id == activity.id) {
            content += ` fa-solid fav`;
            break;
          }
        }
        content += `"></span>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
      }
      exploreDiv.innerHTML = content;
    }

    async function updateFavourites() {
      favouritesDiv.innerHTML = ``;
      for (let activity of favouriteActiv) {
        favouritesDiv.innerHTML += `<div><div class="activity block-wide" id="fv-${activity.id}">
            <img src="${activity.imageUrl}" alt="Activity picture">
            <span class="fa-solid fa-heart fav"></span>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
      }
    }

    const exploreActivities = document.getElementById('exploreID');
    const modalWrapper = document.getElementById('modalWrapper');

    exploreActivities.onclick = function (event) {
      if (!event.target.classList.contains('fa-heart') && !event.target.parentNode.classList.contains('fa-heart')) {
        let target = event.target.parentNode;
        let clickedActivity = document.getElementById(target.id);
        openActivity(clickedActivity.id.substring(3));
      }
    };

    async function openActivity(id) {
      modalWrapper.classList.add('showActivity');

      let modalHeader = document.getElementById('modalHeader');
      let city = document.getElementById('city');
      let descriptionText = document.getElementById('descriptionText');
      let mapLongLat = document.getElementById('mapLongLat');
      let tipsAndRecommendation = document.getElementById('tipsAndRecommendation');

      let currentActivity = await getActivity(id);
      let cityDB = await getActivityPlaceObject(id);
      let categories = await getCategories(id);

      modalHeader.innerHTML = `<h2 id="title">${currentActivity.name}</h2><img src="${currentActivity.imageUrl}"><span class="fa-solid fa-xmark"></span>`;
      city.innerHTML = cityDB.city;
      descriptionText.innerHTML = currentActivity.about;


      console.log(currentActivity)
      tipsAndRecommendation.innerHTML = `<div>${currentActivity.category[0]}</div>`

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
    }

    const closeButton = document.getElementById('closeButton');

    closeButton.addEventListener('click', () => {
      console.log('event listener close button');
      modalWrapper.classList.remove('showActivity');
    });

    function addFavoritesAction() {
      const act = document.querySelectorAll('.fa-heart');
      act.forEach((activityH) => {
        activityH.removeEventListener('click', function () {
          modifyFavourites(activityH);
        });
        activityH.addEventListener('click', function () {
          modifyFavourites(activityH);
        });
      });
    }
  }
}
