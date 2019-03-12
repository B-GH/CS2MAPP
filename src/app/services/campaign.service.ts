import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { AuthenticationService } from "./authentication.service";

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  apiUrl = 'http://cs2m.oneway.agency/api';

  constructor(
      public http: HttpClient,
      public toastCtrl: ToastController,
      private authenticationService: AuthenticationService
  ) {}

  getCampaign(pin) {
    return new Promise(resolve => {
      this.http.get(this.apiUrl + '/campaign/' + pin).subscribe(data => {
        resolve(data);
      }, err => {
        if (401 == err.status) { this.authenticationService.logout() }
        console.log(err);
        this.errorPopup('Code PIN Invalide')
      });
    });
  }

  getQuestions(campaign_id) {
    return new Promise(resolve => {
      this.http.get(this.apiUrl + '/campaign/questions/' + campaign_id).subscribe(data => {
        resolve(data);
      }, err => {
        if (401 == err.status) { this.authenticationService.logout() }
        console.log(err);
        this.errorPopup('Questions not founds')
      });
    });
  }

  sendResponses(responses: []) {
    this.http.post(this.apiUrl + '/campaign/responses/send', responses).subscribe((data) => {
      this.errorPopup(data['success'])
    }, err => {
      if (401 == err.status) { this.authenticationService.logout() }
      console.log(err);
      this.errorPopup('Error send data, please contact admin !')
    });
  }

  sendRoute(route) {
    return new Promise(resolve => {
      this.http.post(this.apiUrl + '/campaign/position/send', route)
        .subscribe(data => {
          resolve(data);
        }, err => {
          if (401 == err.status) { this.authenticationService.logout() }
          console.log(err);
          this.errorPopup('Error send data, please contact admin !')
        });
    });
  }

  sendPicture(picture) {
    return new Promise(resolve => {
      this.http.post(this.apiUrl + '/campaign/picture/send', picture)
        .subscribe(data => {
          resolve(data);
        }, err => {
          if (401 == err.status) { this.authenticationService.logout() }
          console.log(err);
          this.errorPopup('Error send data, please contact admin !')
        });
    });
  }

  async errorPopup(error : string) {
    const toast = await this.toastCtrl.create({
      message: error,
      duration: 3000,
      position: 'top',
      closeButtonText: 'OK',
      showCloseButton: true
    });

    await toast.present();
  }
}
