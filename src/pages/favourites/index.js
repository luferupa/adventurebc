'use strict';

import { AuthenticatedUser } from '../../index';
import { favouriteActiv } from '../home/index';
import { getActivityPlace } from '../../firebase/activities';

export default async function Favourites() {
    if (!AuthenticatedUser) {
        location.hash = '#welcome';
      } else {
        const divFavourites = document.querySelector(".activity-wrapper");
        updateFavourites();

        async function updateFavourites(){
            divFavourites.innerHTML = ``;
              for(let activity of favouriteActiv){
                divFavourites.innerHTML += `<div><div class="activity block-wide"">
                  <img src="${activity.imageUrl}" alt="Activity picture">
                  <span class="fa-regular fa-heart"></span>
                  <h3>${activity.name}</h3>
                  <p>${await getActivityPlace(activity.id)}</p>
                  </div></div>`;
              }
          }
      }
}
