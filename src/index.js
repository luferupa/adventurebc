'use strict';

import 'regenerator-runtime';
import 'bootstrap';

import { auth, signOutAuth } from './firebase';

// static pages
import './pages/login/login.html';
import './pages/register/register.html';
import './pages/guide/guide.html';
import './pages/home/home.html';
import './pages/welcome/welcome.html';

// styles
import './styles/index.scss';

import Router, { Page } from './routing';

//setting up the Router with pages
Router.init([
  // no-auth pages
  new Page('#guide', './pages/guide.html', 'guide', false),// 1st Page is default if no URL match
  new Page('#welcome', './pages/welcome.html', 'welcome', false),
  new Page('#login', './pages/login.html', 'login', false), 
  new Page('#register', './pages/register.html', 'register', false),

  // auth-pages
  new Page('#home', './pages/home.html', 'home'),
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
      location.hash = 'login';
    }
  } else {
    location.hash = 'login';
  }
});

const signOut = document.getElementById('signOut');

if (signOut) {
  signOut.addEventListener('click', async (event) => {
    await signOutAuth();
  });
}
