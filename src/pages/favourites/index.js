'use strict';

import { AuthenticatedUser } from '../../index';
import { favouriteActiv, updateFav } from '../home/index';
import { getActivityPlace } from '../../firebase/activities';
import { setLoader } from '../../utils';
import { removeFavorite } from '../../firebase/users';

export default async function Favourites() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    if (window.myPlannerSnapshotUnsubscribe) {
      window.myPlannerSnapshotUnsubscribe();
      window.myPlannerSnapshotUnsubscribe = null;
    }

    const divFavourites = document.querySelector('.activity-wrapper');
    setLoader(true);
    await updateFavourites();
    addFavoritesAction();
    setLoader(false);

    async function updateFavourites() {
      divFavourites.innerHTML = ``;
      for (let activity of favouriteActiv) {
        divFavourites.innerHTML += `<div><div class="activity block-wide" id="${activity.id}">
                  <img src="${activity.imageUrl}" alt="Activity picture">
                  <div class="heart"><span class="fa-solid fa-heart fav"></span></div>
                  <h3>${activity.name}</h3>
                  <p>${await getActivityPlace(activity.id)}</p>
                  </div></div>`;
      }
    }

    function addFavoritesAction() {
      const act = document.querySelectorAll('.activity .heart');
      act.forEach((activityH) => {
        activityH.addEventListener('click', function () {
          modifyFavourites(activityH);
        });
      });
    }

    async function modifyFavourites(favouriteH) {
      await removeFavorite(AuthenticatedUser.id, favouriteH.parentElement.id);

      AuthenticatedUser.favourites = AuthenticatedUser.favourites.filter(function (value) {
        return value.id != favouriteH.parentElement.id;
      });

      await updateFav(AuthenticatedUser.favourites);
      await updateFavourites();
      addFavoritesAction();
    }
  }
}
