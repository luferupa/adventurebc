'use strict';

import { AuthenticatedUser } from '../../index';
import { changeUserPicture, signOutAuth } from '../../firebase/auth';

export default async function AuthTemplate() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  }

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

  changeProfilePic.addEventListener('click', async ($event) => {
    $event.preventDefault();

    document.querySelector('.file-upload').click();
  });

  document.querySelector('.file-upload').onchange = async function (e) {
    const uploadedFile = e.target.files[0];

    const response = await changeUserPicture(uploadedFile, AuthenticatedUser);

    AuthenticatedUser.avatarURL = response;
    userAvatar.setAttribute('src', AuthenticatedUser.avatarUrl);
  };

  /**
   * handles the marking of the current active link (#hash)
   */
  function markActiveLink() {
    if (document.querySelector(`.nav-link[href='${location.hash}']`)) {
      document.querySelector('.nav-link.active').classList.remove('active');
      document.querySelector(`.nav-link[href='${location.hash}']`).classList.add('active');
    }
  }
}
