import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IncomePage } from './income';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';


@NgModule({
  declarations: [
    IncomePage,

  ],
  imports: [
    IonicPageModule.forChild(IncomePage),
     NgxQRCodeModule,
  ],
  providers: [
    BarcodeScanner
  ]
})
export class IncomePageModule {}
