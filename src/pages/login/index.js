'use strict';

import { signInWithGoogle } from '../../firebase';

export default async function Login() {
  console.log('initializing login.js ' + new Date());

  submit.addEventListener('click', async (event) => {
    try {
      await signInWithGoogle();
      location.hash = '#guide';
      location.reload();
    } catch (error) {}
  });
}
