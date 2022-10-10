import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service'


/**
 * Generated class for the AboutusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-aboutus',
  templateUrl: 'aboutus.html',
})
export class AboutusPage {
  title:string="关于我们"
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutusPage');
  }
  
  items = [
    '推荐评分',
    '检测新版',
  ];

  itemSelected(item: string) {
    console.log("Selected Item", item);
  }

  ionViewEnter(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
  }

  ionViewWillEnter(){
    
  }
}
