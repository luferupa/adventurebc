'use strict';

import { AuthenticatedUser } from '../../index';

import { getCategories } from '../../firebase/categories';
import { getCities } from '../../firebase/cities';
import { activitiesCollection, getActivities, getActivitiesWhere } from '../../firebase/activities';

export default function Search() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    let categoryOptions;
    let locationOptions;

    const categorySelect = document.getElementById('category-sel');
    const locationSelect = document.getElementById('location-sel');
    const adventureName = document.getElementById('adventure-name');

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

    editButton.addEventListener('click', function (event) {
      adventureName.readOnly = false;
      adventureName.focus();
    });

    adventureName.addEventListener('focusout', function (event) {
      adventureName.readOnly = true;
    });

    document.getElementById('open-search').addEventListener('click', function (event) {
      document.getElementById('search').classList.remove('hideBar');
    });

    document.getElementById('close-search').addEventListener('click', function (event) {
      document.getElementById('search').classList.add('hideBar');
    });

    sbSearch.addEventListener('click', function (event) {
      document.getElementById('search').classList.add('hideBar');

      let category = document.getElementById('category-sel').value;
      let location = document.getElementById('location-sel').value;
      
      searchActivity(category, location);

    });

    async function searchActivity(category, location){
      let suggestions = new Array();
      //let query = query(activitiesCollection, where("name", "==", "Stanley Park Bike Tour"));
      console.log("Category - "+ category);
      console.log("Location - "+ location);

      if(category == "Categories"){
        suggestions = await getActivitiesWhere(null, location);
      }else if(location == "Location"){
        suggestions = await getActivitiesWhere(category, null);
      }else{
        suggestions = await getActivitiesWhere(category, location);
      }

      
      //getActivitiesWhere();
    }
  }

  
}
