'use strict';

export class Page {
  constructor(name, htmlName, jsName, auth = true) {
    this.name = name;
    this.htmlName = htmlName;
    this.jsName = jsName;
    this.authRequired = auth;
  }
}

export default class Router {
  static init(pages) {
    Router.pages = pages;
    window.addEventListener('hashchange', function (e) {
      Router.handleHashChange();
    });
    Router.handleHashChange();
  }

  static handleHashChange() {
    const urlHash = window.location.hash;

    if (urlHash.length > 0) {
      // If there is a hash in URL
      for (let i = 0; i < Router.pages.length; i++) {
        // find which page matches the hash then navigate to it
        if (urlHash === Router.pages[i].name) {
          Router.goToPage(Router.pages[i]);
          break;
        }
      }
    } else {
      // If no hash in URL, load the first Page as the default page
      Router.goToPage(Router.pages[0]);
    }
  }

  static async goToPage(page) {
    if (!page.authRequired) {
      document.getElementById('auth').remove();
      Router.rootElem = document.getElementById('noAuthArea');
    } else {
      Router.rootElem = document.getElementById('authArea');
    }

    try {
      const response = await fetch(page.htmlName);
      const txt = await response.text();
      Router.rootElem.innerHTML = txt;
      const init = await import(`./pages/${page.jsName}/`);
      init.default();
    } catch (error) {
      console.error(error);
    }
  }
}