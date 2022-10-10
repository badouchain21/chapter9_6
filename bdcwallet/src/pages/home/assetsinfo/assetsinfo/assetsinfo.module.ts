import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetsinfoPage } from './assetsinfo';

@NgModule({
  declarations: [
    AssetsinfoPage,
  ],
  imports: [
    IonicPageModule.forChild(AssetsinfoPage)
  ]
})
export class AssetsinfoPageModule {}
