'use strict';

import 'regenerator-runtime';

// Bootstrap
// Import just what we need

// import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/button';
import 'bootstrap/js/dist/carousel';
// import 'bootstrap/js/dist/collapse';
// import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/modal';
// import 'bootstrap/js/dist/popover';
// import 'bootstrap/js/dist/scrollspy';
// import 'bootstrap/js/dist/tab';
// import 'bootstrap/js/dist/toast';
// import 'bootstrap/js/dist/tooltip';

import { auth, signOutAuth } from './firebase';

//fontawesome
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

// static pages
import './pages/guide/guide.html';
import './pages/home/home.html';
import './pages/welcome/welcome.html';
import './pages/auth-template/auth-template.html';
import './pages/search/search.html';

// styles
import './styles/index.scss';

import Router, { Page } from './routing';

//setting up the Router with pages
Router.init([
  // no-auth pages
  new Page('#guide', './pages/guide.html', 'guide', false), // 1st Page is default if no URL match
  new Page('#welcome', './pages/welcome.html', 'welcome', false),

  // auth-pages
  new Page('#home', './pages/home.html', 'home'),
  new Page('#search', './pages/search.html', 'search'),
  // add new pages here
]);

auth.onAuthStateChanged(async (userInfo) => {
  if (userInfo) {
    try {
      console.log(userInfo);

      // if (location.hash !== '#guide') {
      //   location.hash = '#guide';
      //   location.reload();
      // }
    } catch (error) {
      // location.hash = 'login';
    }
  } else {
    // location.hash = 'login';
  }
});

const signOut = document.getElementById('signOut');

if (signOut) {
  signOut.addEventListener('click', async (event) => {
    await signOutAuth();
  });
}
