import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IpfsVedioPage } from './ipfs-vedio';

@NgModule({
  declarations: [
    IpfsVedioPage,
  ],
  imports: [
    IonicPageModule.forChild(IpfsVedioPage),
  ],
})
export class IpfsVedioPageModule {}
