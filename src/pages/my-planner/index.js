'use strict';

import { AuthenticatedUser, Modal } from '../../index';

import { db, collection, doc, onSnapshot } from '../../firebase';
import { getActivity } from '../../firebase/activities';
import { getFormattedDate, getDaysArray, setLoader } from '../../utils/index.js';
import { addAdventure, clearAdventures } from '../../firebase/adventures';

export default async function MyPlanner() {
  const activitiesCollection = collection(db, 'activities');

  let userAdventures = [];
  let myPlannerSnapshot;
  let currentAdventure;
  let currentAdventureId = null;
  let plannerDates = [];

  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    myPlannerSnapshot = onSnapshot(doc(db, 'users', AuthenticatedUser.id), { includeMetadataChanges: true }, (doc) => {
      if (!doc.metadata.hasPendingWrites && doc.data().adventures.length > 0 && location.hash === '#myPlanner') {
        setLoader(true);
        userAdventures = doc.data().adventures;

        userAdventures.forEach((adventure) => {
          adventure.activities = [];

          adventure.userActivities.forEach(async (item) => {
            const activity = await getActivity(item.activityId.id);
            adventure.activities &&
              adventure.activities.push({ ...activity, dayOrder: item.dayOrder, daySlot: item.daySlot });
          });
        });

        if (location.hash.split('/')[1]) {
          currentAdventure = userAdventures.find((adventure) => adventure.id === location.hash.split('/')[1]);
        }

        if (currentAdventure) {
          currentAdventure = userAdventures.find((adventure) => adventure.id === currentAdventure.id);
        } else if (currentAdventureId) {
          currentAdventure = userAdventures.find((adventure) => adventure.id === currentAdventureId);
        } else {
          currentAdventure = userAdventures[0];
        }

        getPlannerDates();

        setTimeout(() => {
          renderUiElements();
          setLoader(false);
        }, 1000);
      }
    });

    // Stop listening to changes
    // unsubscribe();
  }

  /**
   * render the DOM elements
   */
  function renderUiElements() {
    populateDropdown();
    populateAdventureMeta();
    populateToSchedule();
    populateDatedSlots();
    setModalDatesMinMaxValues();

    document.querySelectorAll('.schedule-button').forEach((item) => {
      item.addEventListener('click', function () {
        daySlot.value = '';
        dayOrder.value = '';
        document.querySelector('#scheduleActivityModal #activityId').value = this.parentElement.parentElement.id;
        Modal.getOrCreateInstance(document.getElementById('scheduleActivityModal')).show();
      });
    });

    document.querySelectorAll('.delete-button').forEach((item) => {
      item.addEventListener('click', function () {
        document.querySelector('#deleteModal #activityId1').value = this.parentElement.id;
        Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
      });
    });

    /**
     * handles the register form submit
     */
    scheduleForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();
        event.stopPropagation();

        let promises = [];

        if (daySlot.value && dayOrder.value && activityId.value) {
          setLoader(true);
          await clearAdventures(AuthenticatedUser.id);

          userAdventures.map(async (adventure) => {
            delete adventure.activities;

            adventure.userActivities.forEach((activity) => {
              if (adventure.id === currentAdventure.id && activity.activityId.id === activityId.value) {
                activity.activityId = doc(activitiesCollection, activity.activityId.id);
                activity.daySlot = daySlot.value;
                activity.dayOrder = dayOrder.value;
              }
            });

            promises.push(addAdventure(adventure, AuthenticatedUser.id));
          });

          await Promise.all(promises);
          Modal.getOrCreateInstance(document.getElementById('scheduleActivityModal')).hide();
        }
      },
      false
    );

    /**
     * handles the delete activity
     */
    deleteModalSubmit.addEventListener(
      'click',
      async () => {
        let promises = [];

        if (activityId1.value) {
          setLoader(true);
          await clearAdventures(AuthenticatedUser.id);

          userAdventures.map(async (adventure) => {
            delete adventure.activities;

            adventure.userActivities = adventure.userActivities.filter((activity) => {
              if (adventure.id === currentAdventure.id) {
                if (activity.activityId.id !== activityId1.value) {
                  return true;
                }
              } else {
                return true;
              }
            });

            promises.push(addAdventure(adventure, AuthenticatedUser.id));
          });

          await Promise.all(promises);
          Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
        }
      },
      false
    );
  }

  /**
   * gets the planner dates between the beginning and end date, inclusion
   */
  function getPlannerDates() {
    if (currentAdventure && currentAdventure.beginningDate && currentAdventure.endDate) {
      plannerDates = getDaysArray(new Date(currentAdventure.beginningDate), new Date(currentAdventure.endDate));
    }
  }

  /**
   * handles the population of the dropdown that selects current adventure
   */
  function populateDropdown() {
    adventureSelectionButton.innerText = currentAdventure?.name || 'Select';
    document.querySelector('.my-planner .dropdown-menu').innerHTML = '';

    userAdventures.forEach((adventure) => {
      document.querySelector(
        '.my-planner .dropdown-menu'
      ).innerHTML += `<li ><a class="dropdown-item">${adventure.name}</a></li>`;
    });

    document.querySelectorAll('.my-planner .dropdown-menu .dropdown-item').forEach((item) => {
      item.addEventListener('click', function () {
        if (adventureSelectionButton.innerText !== this.innerText) {
          currentAdventure = userAdventures.find((adventure) => adventure.name === this.innerText);
          currentAdventureId = currentAdventure.id;
          getPlannerDates();
          adventureSelectionButton.innerText = currentAdventure.name;
          renderUiElements();
        }
      });
    });

    // setLoader(false);
  }

  /**
   * this method will populate the dates and dropdown names of the adventure, user name and activity number
   */
  function populateAdventureMeta() {
    if (currentAdventure && currentAdventure.activities) {
      let promises = [];

      beginningDate.value = getFormattedDate(currentAdventure.beginningDate, true);
      endDate.value = getFormattedDate(currentAdventure.endDate, true);
      adventureCreator.innerText = AuthenticatedUser.username;
      activityNumber.innerText = currentAdventure.activities.length;

      beginningDate.addEventListener('change', function () {
        updateDateRanges(this.id, this.value);
      });

      endDate.addEventListener('change', function () {
        updateDateRanges(this.id, this.value);
      });

      async function updateDateRanges(entity, value) {
        setLoader(true);
        await clearAdventures(AuthenticatedUser.id);

        userAdventures.map(async (adventure) => {
          delete adventure.activities;

          if (adventure.id === currentAdventure.id) {
            adventure[entity] = value;
          }

          promises.push(addAdventure(adventure, AuthenticatedUser.id));
        });

        await Promise.all(promises);
      }
    }
  }

  /**
   * handles the population of the activities to be scheduled
   */
  function populateToSchedule() {
    const activityWrapper = document.querySelector('.my-planner .to-schedule .activity-wrapper');
    activityWrapper.innerHTML = `<div class="activity add-activity"><span class="fa-solid fa-plus"></span></div>`;

    if (currentAdventure.activities && currentAdventure.activities.length > 0) {
      currentAdventure.activities.forEach((activity) => {
        if (activity.daySlot === '' || !plannerDates.includes(activity.daySlot)) {
          const activityDOM = `
        <div class="activity" id=${activity.id}>
          <img
            src="${activity.imageUrl}"
            alt="Activity picture"
          />
          <span class="fa-regular fa-heart"></span>
          <button class="delete-button"><span class='fa-solid fa-xmark'></span></button>
          <h3>${activity.name}</h3>
          <p>${activity.place}</p>
          <div class="hover-state">
            <button class="btn btn-secondary schedule-button" >Schedule</button>
          </div>
      </div>`;

          activityWrapper.innerHTML += activityDOM;
        }
      });
    }

    document.querySelector('.add-activity').addEventListener('click', function () {
      location.hash = `#search/${currentAdventure.id}`;
    });
  }

  /**
   * handles the population of the activities that are scheduled
   */
  function populateDatedSlots() {
    accordionPanelsForScheduling.innerHTML = '';

    plannerDates.forEach((date) => {
      let scheduledActivities = [];

      currentAdventure.activities &&
        currentAdventure.activities
          .sort((a, b) => a.dayOrder - b.dayOrder)
          .forEach((activity) => {
            if (activity.daySlot === date) {
              scheduledActivities.push(`<div class='activity' id=${activity.id}>
          <img
            src='${activity.imageUrl}'
            alt='Activity picture'
          />
          <span class='fa-regular fa-heart'></span>
          <button class="delete-button"><span class='fa-solid fa-xmark'></span></button>
          <h3>${activity.name}</h3>
          <p>${activity.place}</p>
          <div class='hover-state'>
            <button class='btn btn-secondary schedule-button'>Schedule</button>
          </div>
        </div>`);
            }
          });

      let scheduledDom = `<div class="accordion-item">
      <h2 class="accordion-header" id="panelsStayOpen-headingOne">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#panelsStayOpen-collapse-${date}"
          aria-expanded="true"
          aria-controls="panelsStayOpen-collapse-${date}"
        >
          <span class="square"></span>
          <span class="label">${getFormattedDate(date)}</span>
        </button>
      </h2>
      <div
        id="panelsStayOpen-collapse-${date}"
        class="accordion-collapse collapse show"
        aria-labelledby="panelsStayOpen-headingOne"
      >
        <div class="accordion-body">
          <div class="horizontal-scroll">
            <div class="activity-wrapper">
            ${scheduledActivities.join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;

      accordionPanelsForScheduling.innerHTML += scheduledDom;
    });
  }

  /**
   * set the min/max values date-picker for modal
   */
  function setModalDatesMinMaxValues() {
    document.getElementById('daySlot').min = currentAdventure.beginningDate;
    document.getElementById('daySlot').max = currentAdventure.endDate;
  }
}
