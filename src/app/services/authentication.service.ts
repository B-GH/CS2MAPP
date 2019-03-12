import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NavController, MenuController, ToastController, AlertController, LoadingController } from '@ionic/angular';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(false);

  constructor(
      private storage: Storage,
      private http: HttpClient,
      public alertCtrl: AlertController,
      public toastCtrl: ToastController,
      private plt: Platform) {

    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  checkToken() {
    this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    })
  }

  login(credentials: any) {
    return this.http.post('http://cs2m.oneway.agency/api/login', credentials)
        .toPromise()
        .then(data => {
          this.loginSuccess();
          this.storage.set('user', data['user']);
          this.storage.set(TOKEN_KEY, data['token']).then(() => {
            this.authenticationState.next(true);
          });
        })
        .catch(e => this.forgotPass(e));
  }

  logout() {
    return this.storage.clear().then(() => {
      this.authenticationState.next(false);
    });
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }

  async forgotPass(e) {
    console.log('login error', e);
    const alert = await this.alertCtrl.create({
      header: 'Erreur Login',
      message: 'Login ou mot de passe invalide',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }
      ]
    });
  }

  async loginSuccess() {
    const toast = await this.toastCtrl.create({
      message: 'Login avec succes',
      duration: 3000,
      position: 'top',
      closeButtonText: 'OK',
      showCloseButton: true
    });

    await toast.present();
  }
}
