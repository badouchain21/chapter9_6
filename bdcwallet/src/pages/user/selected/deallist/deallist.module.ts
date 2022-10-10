import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeallistPage } from './deallist';

@NgModule({
  declarations: [
    DeallistPage,
  ],
  imports: [
    IonicPageModule.forChild(DeallistPage),
  ],
})
export class DeallistPageModule {}
