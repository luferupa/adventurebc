'use strict';

import { AuthenticatedUser } from '../../index';
import { getUserAdventures, getUserFavorites } from '../../firebase/users';
import { getActivityPlace, getActivitiesRandom, getActivity, getActivityPlaceObject } from '../../firebase/activities';

export default async function Home() {

  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    const userAdventures = await getUserAdventures(AuthenticatedUser.id);
    console.log(userAdventures);
    const myAdventuresDiv = document.querySelector(".my-adventures .horizontal-scroll");
    const randomActivities = await getActivitiesRandom();
    console.log(randomActivities);
    const exploreDiv = document.querySelector(".explore .horizontal-scroll");
    const favouriteActiv = await getUserFavorites(AuthenticatedUser.id);
    console.log(favouriteActiv);
    const favouritesDiv = document.querySelector(".favourites .horizontal-scroll");

    updateMyAdventures();
    updateExplore();
    //updateFavourites();

    async function updateMyAdventures(){
      myAdventuresDiv.innerHTML = ``;
        for(let userAdventure of userAdventures){

          myAdventuresDiv.innerHTML += `<div><div class="activity block-narrow"">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${userAdventure.name}</h3>
            <p>${userAdventure.beginningDate.toDate().toDateString()} - ${userAdventure.endDate.toDate().toDateString()}</p>
            </div></div>`;
        }
    }

    async function updateExplore(){
      exploreDiv.innerHTML = ``;
        for(let activity of randomActivities){

          exploreDiv.innerHTML += `<div><div class="activity block-wide"">
            <img id="${activity.id}" src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3 id="${activity.id}">${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
        }
    }

    async function updateFavourites(){
      favouritesDiv.innerHTML = ``;
      console.log(favouriteActiv.length);
        for(let activity of favouriteActiv){
          console.log(activity);
          favouritesDiv.innerHTML += `<div><div class="activity block-wide"">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
        }
    }


    const exploreActivities = document.getElementById('exploreID');
    const modalWrapper = document.getElementById('modalWrapper');

    exploreActivities.onclick = function(event) {
      let target = event.target;
      let clickedActivity = document.getElementById(target.id);

      openActivity(clickedActivity.id);
    }

    async function openActivity(id) {
      let currentID = id;
      modalWrapper.classList.add('showActivity');

      let modalHeader = document.getElementById('modalHeader');
      let city = document.getElementById('city');
      let descriptionText = document.getElementById('descriptionText');
      let mapLongLat = document.getElementById('mapLongLat')

      let currentActivity = await getActivity(currentID);
      let cityDB = await getActivityPlaceObject(currentID);

      modalHeader.innerHTML = `<h2 id="title">${currentActivity.name}</h2><img src="${currentActivity.imageUrl}"><span class="fa-solid fa-xmark"></span>`;
      city.innerHTML = cityDB.city;
      descriptionText.innerHTML = currentActivity.about;

      mapLongLat.innerHTML = 
      `<iframe
      frameborder="0" 
      scrolling="no" 
      marginheight="0" 
      marginwidth="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${cityDB.coordinates._long - 0.01}%2C${cityDB.coordinates._lat - 0.01}%2C${cityDB.coordinates._long + 0.01}%2C${cityDB.coordinates._lat + 0.01}&amp;layer=mapnik&amp;marker=${cityDB.coordinates._lat}%2C${cityDB.coordinates._long}" 
      </iframe>` 
    }

    const closeButton = document.getElementById("closeButton");
    console.log(closeButton);

    closeButton.addEventListener('click', () => {
      console.log("event listener close button");
      modalWrapper.classList.remove('showActivity');
    });
  }
}