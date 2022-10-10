import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { NativeService } from '../../../../servies/Native.service';


@IonicPage()
@Component({
  selector: 'page-selected',
  templateUrl: 'selected.html',
})
export class SelectedPage {
	title:string="选择钱包"; //标题
	walletInfo:any=[]; //本地钱包数据
  walletKey:any; //钱包key值数组
  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public navService:NativeService,
  	public viewCtrl:ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectedPage');
  }

  ionViewWillEnter(){
    this.walletInfo=this.navService.get('walletSql')
    this.walletKey=Object.keys(this.walletInfo)
  }

  //选择钱包
  selectWallet(index){
  	this.navService.set('walletIndex',index);
  	let data=index
		this.viewCtrl.dismiss(data);

  }

  //取消
  cancelBack(){
  	let data=this.navService.get('walletIndex')
  	this.viewCtrl.dismiss(data);
  }

}
