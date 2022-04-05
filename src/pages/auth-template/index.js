'use strict';

import { AuthenticatedUser, Modal } from '../../index';
import { changeUserPicture, signOutAuth } from '../../firebase/auth';
import { setLoader } from '../../utils';

export default async function AuthTemplate() {
  if (!AuthenticatedUser) {
    location.hash = '#welcome';
  } else {
    setUserInfo(AuthenticatedUser);
  }

  signOut.addEventListener('click', async () => {
    try {
      await signOutAuth();
    } catch (error) {
      console.log(error);
    }
  });

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    changeProfilePicDesktop.remove();
    changeProfilePicMobile.addEventListener('click', async ($event) => {
      $event.preventDefault();

      document.querySelector('.file-upload').click();
    });
  } else {
    changeProfilePicMobile.remove();
    changeProfilePicDesktop.addEventListener('click', async ($event) => {
      $event.preventDefault();
      document.querySelector('.video-wrapper').style.display = 'block';
      document.querySelector('.canvas-wrapper').style.display = 'none';

      const video = document.getElementById('video');

      // Elements for taking the snapshot
      const canvas = createCanvas();
      const context = canvas.getContext('2d');
      context.scale(0.5, 0.5);

      setTimeout(() => {
        Modal.getOrCreateInstance(document.getElementById('profilePicModal')).show();
      }, 1000);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          //video.src = window.URL.createObjectURL(stream);
          video.srcObject = stream;
          // video.play();  // or autplay
        });
      } else {
        console.log('media devices not available in this browser');
      }

      // Trigger photo take
      document.getElementById('snap').addEventListener('click', () => {
        document.querySelector('.video-wrapper').style.display = 'none';
        document.querySelector('.canvas-wrapper').style.display = 'block';
        context.drawImage(video, 0, 0);
      });

      // trigger snap again
      document.getElementById('captureAgain').addEventListener('click', () => {
        document.querySelector('.video-wrapper').style.display = 'block';
        document.querySelector('.canvas-wrapper').style.display = 'none';
      });

      // trigger upload
      document.getElementById('uploadPic').addEventListener('click', async () => {
        canvas.toBlob(async (blob) => {
          await uploadProfilePicture(blob);
          Modal.getOrCreateInstance(document.getElementById('profilePicModal')).hide();
        }, 'image/jpeg');
      });

      // handles the bootstrap modal close event
      document.getElementById('profilePicModal').addEventListener('hidden.bs.modal', function () {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      });
    });
  }

  /**
   * handles the file upload
   */
  document.querySelector('.file-upload').onchange = async function (e) {
    const uploadedFile = e.target.files[0];

    await uploadProfilePicture(uploadedFile);
  };

  /**
   * uploads the profile picture to the firebase storage
   * @param {blob} file the file to be uploaded
   */
  async function uploadProfilePicture(file) {
    setLoader(true);
    try {
      const response = await changeUserPicture(file, AuthenticatedUser);

      AuthenticatedUser.avatarURL = response;
      userAvatar.setAttribute('src', window.URL.createObjectURL(file));
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  }

  /**
   * handles the setting of username in the header
   */
  function setUserInfo(user) {
    setTimeout(() => {
      username && (username.innerText = user.username ? user.username.split(' ')[0] : 'Username');
      userAvatar && userAvatar.setAttribute('src', user.avatarUrl);

      if (!user.isAdmin) {
        document.querySelector('.add-activity').remove();
      }
    }, 1000);
  }

  /**
   * crates a new canvas
   */
  function createCanvas() {
    const existingCanvas = document.getElementById('canvas');

    if (existingCanvas) {
      existingCanvas.remove();
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvas.setAttribute('width', '310');
    canvas.setAttribute('height', '220');

    document.querySelector('.canvas-wrapper').prepend(canvas);

    return canvas;
  }
}
