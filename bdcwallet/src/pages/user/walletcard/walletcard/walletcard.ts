import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../../servies/Native.service';

@IonicPage()
@Component({
  selector: 'page-walletcard',
  templateUrl: 'walletcard.html',
})
export class WalletcardPage {
	title:string="管理钱包" //标题
  totalAssets:string; //总资产
  walletInfo:any; //存储获取到的钱包数据
  walletTitle:String; //钱包名称
  walletAddress:string; //收款地址
  isFooter:boolean = true //控制footer是否存在
  walletKey:any; //钱包数据对象key值数组

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,) {
  }

  ionViewWillEnter(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
    this.isFooter=true;
    //获取本地钱包数据
    this.walletInfo=this.navService.get('walletSql');
    this.walletKey=Object.keys(this.walletInfo)
    console.log(this.walletInfo);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalletcardPage');
  }

  //页面离开时隐藏底部按钮
  ionViewWillLeave(){
    this.isFooter=false;
  }

  //跳转钱包信息页面
  goWalletinfo(index){
  	this.navCtrl.push('WalletinfoPage',{
      index:index,
    })
  }

  //跳转创建钱包页面
  goCrewallet(){
    this.navCtrl.push('CrewalletPage')
  }

  //跳转选择私钥类型页面
  goImwallet(){
    this.navCtrl.push('SelectTypePage')
  }

}
