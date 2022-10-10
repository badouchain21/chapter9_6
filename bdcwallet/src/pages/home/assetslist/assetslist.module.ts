import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetslistPage } from './assetslist';

@NgModule({
  declarations: [
    AssetslistPage,
  ],
  imports: [
    IonicPageModule.forChild(AssetslistPage),
  ],
})
export class AssetslistPageModule {}
