import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DealPage } from './deal';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@NgModule({
  declarations: [
    DealPage,
  ],
  imports: [
    IonicPageModule.forChild(DealPage),
    NgxQRCodeModule,
  ],
  providers: [
    BarcodeScanner
  ]
})
export class DealPageModule {}
