'use strict';

import { AuthenticatedUser } from '../../index';
import { getUserAdventures } from '../../firebase/users';
import { getActivityPlace } from '../../firebase/activities';

export default async function Home() {

  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    const userAdventures = await getUserAdventures(AuthenticatedUser.id);
    console.log(userAdventures);
    const myAdventuresDiv = document.querySelector(".my-adventures .horizontal-scroll");

    updateMyAdventures();

    async function updateMyAdventures(){
      myAdventuresDiv.innerHTML = ``;
        for(let userAdventure of userAdventures){

          myAdventuresDiv.innerHTML += `<div><div class="activity"">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${userAdventure.name}</h3>
            <p>${userAdventure.beginningDate.toDate().toDateString()} - ${userAdventure.endDate.toDate().toDateString()}</p>
            </div></div>`;
        }
    }
  }
  
  

}
