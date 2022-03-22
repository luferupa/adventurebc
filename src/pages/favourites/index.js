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
                  <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
                  <span class="fa-regular fa-heart"></span>
                  <h3>${activity.name}</h3>
                  <p>${await getActivityPlace(activity.id)}</p>
                  </div></div>`;
              }
          }
      }
}
