import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletinfoPage } from './walletinfo';

@NgModule({
  declarations: [
    WalletinfoPage,
  ],
  imports: [
    IonicPageModule.forChild(WalletinfoPage),
  ],
})
export class WalletinfoPageModule {}
