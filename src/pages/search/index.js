'use strict';

import { AuthenticatedUser } from '../../index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { getActivitiesWhere, getActivityPlace, activitiesCollection } from '../../firebase/activities';
import { addAdventure } from '../../firebase/adventures';
import { Timestamp, doc } from '../../firebase';

export default function Search() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {

    class Adventure{
      constructor (name,beginningDate,endDate,userId){
          this.name = name;
          this.beginningDate = Timestamp.fromDate(beginningDate);
          this.endDate = Timestamp.fromDate(endDate);
          this.userId = userId;
          this.activities = new Array();
      }
      addActivity(activityId){
        this.activities.push(activityId);
      }
      toPlainObject(){
        const clone = {...this};
        return clone;
      }
    }

    let categoryOptions, locationOptions, suggestions ;

    const categorySelect = document.getElementById('category-sel');
    const locationSelect = document.getElementById('location-sel');
    const adventureName = document.getElementById('adventure-name');
    const beginningDate = document.getElementById("from-date");
    const endDate = document.getElementById("to-date");
    const divResults = document.getElementById("suggestions");

    /* INITIAL LOAD - START */
    async function loadCategories() {
      const categories = await getCategories();
      console.log(categories);

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
      console.log(cities);

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

    loadCategories();
    loadLocations();
    /* INITIAL LOAD - END */

    function updateCategory(category) {
      categorySelect.selectedIndex = category;
      let options = Array.from(categoryOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[category - 1].style.backgroundColor = '#D2E4D6';
    }

    function updateLocation(location) {
      locationSelect.selectedIndex = location;
      let options = Array.from(locationOptions);
      options.forEach((option) => (option.style.backgroundColor = 'white'));
      options[location - 1].style.backgroundColor = '#D2E4D6';
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

    sbSearch.addEventListener('click', function (event) {
      document.getElementById('search').classList.add('hideBar');

      let category = document.getElementById('category-sel').value;
      let location = document.getElementById('location-sel').value;
      
      searchActivity(category, location);

    });

    plannerBtn.addEventListener("click", function(){
      let adventure = new Adventure(adventureName.value, new Date(beginningDate.value), new Date(endDate.value), AuthenticatedUser.id);
      adventure.addActivity(doc(activitiesCollection, suggestions[0].id));
      console.log(adventure);
      addAdventure(adventure.toPlainObject());

    });

    async function searchActivity(category, location){
      suggestions = new Array();

      if(category == "Categories"){
        suggestions = await getActivitiesWhere(null, location);
      }else if(location == "Location"){
        suggestions = await getActivitiesWhere(category, null);
      }else{
        suggestions = await getActivitiesWhere(category, location);
      }

      console.log(suggestions);
      
      updateResults(suggestions);

    }

    async function updateResults(suggestions){
      divResults.innerHTML = ``;
        for(const suggestion of suggestions){
            divResults.innerHTML += `<div class="activity">
            <img src="https://firebasestorage.googleapis.com/v0/b/adventurebc-bug-hunters.appspot.com/o/activities%2Fpexels-marco-milanesi-5899783%201.png?alt=media&token=d2f4cb27-60c8-421f-aadc-c07a9ee8165b" alt="Activity picture">
            <span class="fa-regular fa-heart"></span>
            <h3>${suggestion.name}</h3>
            <p>${await getActivityPlace(suggestion.id)}</p>
            </div>`;
        }
        
    }

  }

  
}
