'use strict';

import 'regenerator-runtime';

// Bootstrap
// Import just what we need

// import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/button';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/dropdown';
import Modal from 'bootstrap/js/dist/modal';

export { Modal };

// import 'bootstrap/js/dist/popover';
// import 'bootstrap/js/dist/scrollspy';
// import 'bootstrap/js/dist/tab';
// import 'bootstrap/js/dist/toast';
// import 'bootstrap/js/dist/tooltip';

//fontawesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

// static pages
import './pages/guide/guide.html';
import './pages/home/home.html';
import './pages/welcome/welcome.html';
import './pages/auth-template/auth-template.html';
import './pages/my-planner/my-planner.html';
import './pages/search/search.html';
import './pages/favourites/favourites.html';
import './pages/add-activities/add-activities.html';

// styles
import './styles/index.scss';

import Router, { Page } from './routing';

import { auth } from './firebase';
import { createUserProfileDocument } from './firebase/auth';

export let AuthenticatedUser = null;

//setting up the Router with pages
Router.init([
  // no-auth pages
  new Page('#welcome', './pages/welcome.html', 'welcome', false), // 1st Page is default if no URL match
  new Page('#guide', './pages/guide.html', 'guide', false),

  // auth-pages
  new Page('#home', './pages/home.html', 'home'),
  new Page('#search', './pages/search.html', 'search'),
  new Page('#myPlanner', './pages/my-planner.html', 'my-planner'),
  new Page('#favourites', './pages/favourites.html', 'favourites'),
  new Page('#addActivities', './pages/add-activities.html', 'add-activities'),
  // add new pages here
]);

const toRoute = location.hash;

auth.onAuthStateChanged(async (userInfo) => {
  if (userInfo) {
    try {
      const user = await createUserProfileDocument(userInfo);
      AuthenticatedUser = user;
      console.log(AuthenticatedUser);
      if (location.hash === '#welcome' || location.hash === '') {
        location.hash = toRoute ? (toRoute === '#welcome' ? '#home' : toRoute) : '#home';
      }
    } catch (error) {
      console.log(error);
      location.hash = '#welcome';
    }
  } else {
    location.hash = '#welcome';
  }
});
