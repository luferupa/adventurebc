'use strict';

import { Modal } from '../../index';

import {
  signInWithEmailPassword,
  createWithEmailPassword,
  signInWithGoogle,
  signInWithFacebook,
} from '../../firebase/auth';

export default async function Welcome() {
  /**
   * handles the login form submit
   */
  loginForm.addEventListener(
    'submit',
    async (event) => {
      if (!loginForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      loginForm.classList.add('was-validated');

      if (loginForm.checkValidity() && loginEmail.value && loginPassword.value) {
        console.log(loginEmail.value, loginPassword.value);

        try {
          await signInWithEmailPassword(loginEmail.value, loginPassword.value);
          hideAllModalsAndNavigateToHome();
        } catch (error) {
          console.log(error);
          displayServerError(error.message);
        }
      }
    },
    false
  );

  /**
   * handles the register form submit
   */
  registerForm.addEventListener(
    'submit',
    async (event) => {
      if (!registerForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      registerForm.classList.add('was-validated');

      if (registerForm.checkValidity() && registerUsername.value && registerEmail.value && registerPassword.value) {
        console.log(registerUsername.value, registerEmail.value, registerPassword.value);

        try {
          await createWithEmailPassword(registerEmail.value, registerPassword.value);
          hideAllModalsAndNavigateToHome();
        } catch (error) {
          console.log(error);
          displayServerError(error.message);
        }
      }
    },
    false
  );

  /**
   * handles the google sign in
   */
  document.querySelectorAll('.google-auth').forEach((item) => {
    item.addEventListener('click', async () => {
      try {
        await signInWithGoogle();
        hideAllModalsAndNavigateToHome();
      } catch (error) {
        console.log(error);
        displayServerError(error.message);
      }
    });
  });

  /**
   * handles the facebook sign in
   */
  document.querySelectorAll('.facebook-auth').forEach((item) => {
    item.addEventListener('click', async () => {
      try {
        await signInWithFacebook();
        hideAllModalsAndNavigateToHome();
      } catch (error) {
        console.log(error);
        displayServerError(error.message);
      }
    });
  });

  /**
   * hides all the modal if visible
   */
  const hideAllModalsAndNavigateToHome = () => {
    Modal.getOrCreateInstance(document.getElementById('loginModal')).hide();
    Modal.getOrCreateInstance(document.getElementById('registerModal')).hide();
    location.hash = '#home';
  };

  /**
   * displays the error message to the DOM
   * @param {*} errorMessage the error message from the server
   */
  const displayServerError = (errorMessage) => {
    document.querySelector('.server-error').innerText = errorMessage;
  };
}
