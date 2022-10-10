import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletcardPage } from './walletcard';

@NgModule({
  declarations: [
    WalletcardPage,
  ],
  imports: [
    IonicPageModule.forChild(WalletcardPage),
  ],
})
export class WalletcardPageModule {}
