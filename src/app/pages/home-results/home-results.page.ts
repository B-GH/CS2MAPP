import { Component } from '@angular/core';
import { NavController, AlertController, MenuController, ModalController } from '@ionic/angular';
import { Storage } from "@ionic/storage";
import { CampaignService } from '../../services/campaign.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Subscription } from 'rxjs/Subscription';

import { SearchFilterPage } from '../../pages/modal/search-filter/search-filter.page';

@Component({
  selector: 'app-home-results',
  templateUrl: './home-results.page.html',
  styleUrls: ['./home-results.page.scss']
})

export class HomeResultsPage {
  campaign = {
      id: null,
      pin: null,
      title: null,
      description: null
  };

  isTracking = false;
  isSupervisor = false;
  trackedRoute = [];
  positionSubscription: Subscription;
  latitude:any;
  longitude:any;

  constructor (
    private storage: Storage,
    private campaignService: CampaignService,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private geolocation: Geolocation,
    private camera: Camera
  ) {

    this.setCampaign();
    this.checkSupervisor();
  }

  async searchFilter () {
    const modal = await this.modalCtrl.create({
      component: SearchFilterPage
    });
    return await modal.present();
  }


  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  settings() {
    this.navCtrl.navigateForward('settings');
  }

  async alertLocation() {
    const changeLocation = await this.alertCtrl.create({
      header: 'PIN de la campagne',
      message: 'Insérer le code PIN de la campagne',
      inputs: [
        {
          name: 'pin',
          placeholder: 'Insérez votre code PIN',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Envoyer',
          handler: async (data) => {
            this.campaignService.getCampaign(data.pin)
            .then((campaign) => {
              this.storage.set('campaign', campaign).then(() => {
                this.setCampaign();
              });
            });
          }
        }
      ]
    });

    changeLocation.present();
  }

  async startTracking() {
    this.isTracking = true;
    this.trackedRoute = [];

    this.positionSubscription = this.geolocation.watchPosition()
      .subscribe(data => {
        setTimeout(() => {
          this.campaignService.sendRoute({
            campaign_id: this.campaign.id,
            latitude: data['coords']['latitude'],
            longitude: data['coords']['longitude']
          });
        }, 0);
      });
  }

  async stopTracking() {
    this.isTracking = false;
    this.positionSubscription.unsubscribe();
  }

  async sendPicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      this.setCurrentLocation().then(() => {
        let picture = {
          campaign_id: this.campaign.id,
          image: imageData,
          latitude: this.latitude,
          longitude: this.longitude
        };

        this.campaignService.sendPicture(picture);
      });
    }, (err) => {
      console.log(err);
    });
  }

  async setCampaign() {
    this.storage.get('campaign').then((campaign) => {
      if (campaign) {
        this.campaign.id = campaign.id;
        this.campaign.pin = campaign.pin;
        this.campaign.title = campaign.title;
        this.campaign.description = campaign.description;
      }
    });
  }

  async checkSupervisor() {
    this.storage.get('user').then((user) => {
      if (user) {
        this.isSupervisor = user.isSupervisor	;
      }
    });
  }

  async setCurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
