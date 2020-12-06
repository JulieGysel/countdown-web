import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public gapiSetup: boolean = false; // marks if the gapi library has been loaded
  public authInstance: gapi.auth2.GoogleAuth;
  public error: string;
  public user: gapi.auth2.GoogleUser;

  constructor() { }

  async initGoogleAuth(): Promise<void> {
    //  Create a new Promise where the resolve
    // function is the callback passed to gapi.load
    const pload = new Promise((resolve) => {
      if (!gapi.auth2) {
        gapi.load('auth2', resolve);
      }
    });

    // When the first promise resolves, it means we have gapi
    // loaded and that we can call gapi.init
    return pload.then(async () => {
      await gapi.auth2
        .init({
          client_id: '346300399779-ct1nl6nntohmj3aajruu4klgstqrdkmq.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/calendar',
        })
        .then(auth => {
          this.gapiSetup = true;
          this.authInstance = auth;
        });
    });
  }

  async authenticate(): Promise<gapi.auth2.GoogleUser> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    if (this.authInstance.isSignedIn.get()) {
      this.authInstance.signOut().then(() => {
        this.user = null;
      })
    } else {
      // Resolve or reject signin Promise
      return new Promise(async () => {
        await this.authInstance.signIn().then(
          user => {
            this.user = user;
          },
          error => this.error = error);

      });
    }
  }

  async checkIfUserAuthenticated(): Promise<boolean> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    if (this.authInstance.isSignedIn.get()) {
      this.user = this.authInstance.currentUser.get();
      return true;
    }

    return false;
  }

  getToken() {
    console.log(this.authInstance.currentUser.get().getAuthResponse().access_token);
    return this.authInstance.currentUser.get().getAuthResponse().access_token;
  }

  isUser() {
    return this.gapiSetup && this.user;
  }

}
