import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
// Import other AngularFire modules similarly
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage],
  providers: [
    LocalNotifications
  ]
})
export class HomePageModule {}

