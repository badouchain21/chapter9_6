import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImaccountPage } from './imaccount';

@NgModule({
  declarations: [
    ImaccountPage,
  ],
  imports: [
    IonicPageModule.forChild(ImaccountPage),
  ],
})
export class ImaccountPageModule {}
