'use strict';

import { AuthenticatedUser } from '../../index';
import { getUserAdventures, getUserFavorites } from '../../firebase/users';

import { getActivityPlace, getActivitiesRandom, getActivity } from '../../firebase/activities';
import { getFormattedDate } from '../../utils/index,js';
export let favouriteActiv =  new Array();

export default async function Home() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    const userAdventures = AuthenticatedUser.adventures;
    const myAdventuresDiv = document.querySelector(".my-adventures .horizontal-scroll");
    const randomActivities = await getActivitiesRandom();
    const exploreDiv = document.querySelector(".explore .horizontal-scroll");
    favouriteActiv = await getUserFavorites(AuthenticatedUser.favourites)
    const favouritesDiv = document.querySelector(".favourites .horizontal-scroll");

    updateMyAdventures();
    updateExplore();
    updateFavourites();

    async function updateMyAdventures() {
      myAdventuresDiv.innerHTML = ``;
      for (let userAdventure of userAdventures) {
        myAdventuresDiv.innerHTML += `<div><div class="activity block-narrow" onclick="location.hash = '#myPlanner/${
          userAdventure.id
        }'">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${userAdventure.name}</h3>
            <p>${getFormattedDate(userAdventure.beginningDate)} - ${getFormattedDate(userAdventure.endDate)}</p>
            </div></div>`;
      }
    }

    async function updateExplore() {
      exploreDiv.innerHTML = ``;
      for (let activity of randomActivities) {
        exploreDiv.innerHTML += `<div><div class="activity block-wide"">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
      }
    }

    async function updateFavourites() {
      favouritesDiv.innerHTML = ``;
        for(let activity of favouriteActiv){
          favouritesDiv.innerHTML += `<div><div class="activity block-wide"">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${activity.name}</h3>
            <p>${await getActivityPlace(activity.id)}</p>
            </div></div>`;
      }
    }
  }
}
