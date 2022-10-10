import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response } from '@angular/http';

/**
 * Generated class for the InitpagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-initpage',
  templateUrl: 'initpage.html',
})
export class InitpagePage {
  bitRmb:any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http: Http,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InitpagePage');
    this.resBitRMB()
  }

    //获取人民币兑换比特币的汇率
  resBitRMB(){
    var exchange="https://blockchain.info/tobtc?currency=CNY&value=1"
    this.http.request(exchange).subscribe((res:Response)=>{
      this.bitRmb=res.json();
      this.navService.set('bitExchange',this.bitRmb) 
    })
  }


  //进入创建钱包页面
  goCrewallet(){
  	this.navCtrl.push('CrewalletPage')
  }

  //进入导入钱包页面
  goImwallet(){
  	this.navCtrl.push('SelectTypePage')
  }

  // 进入八斗云中心登录页
  goCenterLogin(){
    this.navCtrl.push('CenterloginPage')
  }
}
  

