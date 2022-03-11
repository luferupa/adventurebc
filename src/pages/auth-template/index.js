'use strict';

import { AuthenticatedUser } from '../../index';
import { changeUserPicture, signOutAuth } from '../../firebase/auth';

export default async function AuthTemplate() {
  console.log('auth init');
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    setUserInfo(AuthenticatedUser);
  }

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
   * handles the setting of username in the header
   */
  function setUserInfo(user) {
    setTimeout(() => {
      username && (username.innerText = user.username ? user.username.split(' ')[0] : 'Username');
      userAvatar && userAvatar.setAttribute('src', user.avatarUrl);
    }, 1000);
  }
}
