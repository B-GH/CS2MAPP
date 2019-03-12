import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { Component } from '@angular/core';
import { Storage } from "@ionic/storage";

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  user = {
    id: null,
    first_name: '',
    last_name: ''
  };

  constructor(
    private storage: Storage,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authenticationService: AuthenticationService,
    private router: Router,
    private androidPermissions: AndroidPermissions
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
          result => console.log('Has permission?',result.hasPermission),
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

        this.androidPermissions.requestPermissions([
          this.androidPermissions.PERMISSION.CAMERA,
          this.androidPermissions.PERMISSION.GET_ACCOUNTS,
          this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          this.androidPermissions.PERMISSION.ACCESS_LOCATION_EXTRA_COMMANDS
        ]);

      this.authenticationService.authenticationState.subscribe(state => {
        if (state) {
          this.storage.get('user').then((user) => {
            this.user = user;
            this.router.navigate(['home']);
          });
        } else {
          this.router.navigate(['login']);
        }
      });

    });
  }


  logout() {
    this.authenticationService.logout();
  }
}
