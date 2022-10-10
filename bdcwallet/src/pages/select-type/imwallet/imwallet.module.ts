import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImwalletPage } from './imwallet';

@NgModule({
  declarations: [
    ImwalletPage,
  ],
  imports: [
    IonicPageModule.forChild(ImwalletPage),
  ],
})
export class ImwalletPageModule {}
