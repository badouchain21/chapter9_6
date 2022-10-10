import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FirstusePage } from './firstuse';

@NgModule({
  declarations: [
    FirstusePage,
  ],
  imports: [
    IonicPageModule.forChild(FirstusePage),
  ],
})
export class FirstusePageModule {}
