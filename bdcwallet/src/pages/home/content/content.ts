import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the ContentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
})
	
export class ContentPage {
	title:string="服务协议";
	content:any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public sanitizer: DomSanitizer) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentPage');
  }

  ionViewWillEnter(){
  	this.content=this.navParams.get('content')

  }

  assembleHTML(strHTML:any){
  return this.sanitizer.bypassSecurityTrustHtml(strHTML);
}


}
