import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InterfacePage } from './interface';

@NgModule({
  declarations: [
    InterfacePage,
  ],
  imports: [
    IonicPageModule.forChild(InterfacePage),
  ],
})
export class InterfacePageModule {}
