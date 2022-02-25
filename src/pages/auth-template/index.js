'use strict';

import { signOutAuth } from '../../firebase';

export default async function Welcome() {
  signOut.addEventListener('click', async () => {
    try {
      await signOutAuth();
    } catch (error) {
      console.log(error);
    }
  });
}
