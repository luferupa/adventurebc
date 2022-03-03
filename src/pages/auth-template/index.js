'use strict';

import { AuthenticatedUser } from '../../index';
import { signOutAuth } from '../../firebase';

export default async function Welcome() {
  markActiveLink();

  document.querySelectorAll('.nav-link').forEach((item) => {
    item.addEventListener('click', () => markActiveLink);
  });

  signOut.addEventListener('click', async () => {
    try {
      await signOutAuth();
    } catch (error) {
      console.log(AuthenticatedUser);
    }
  });

  /**
   * handles the marking of the current active link (#hash)
   */
  function markActiveLink() {
    document.querySelector('.nav-link.active').classList.remove('active');
    document.querySelector(`.nav-link[href='${location.hash}']`).classList.add('active');
  }
}
