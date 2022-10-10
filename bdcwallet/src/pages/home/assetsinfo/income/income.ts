import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform, ActionSheetController,ToastController } from 'ionic-angular';
import { NativeService } from '../../../../servies/Native.service';



@IonicPage()
@Component({
  selector: 'page-income',
  templateUrl: 'income.html',
})
export class IncomePage {
	qrData:String =null; //生成二维码所需数据
  qrFirst:string='0'; //第一个二维码中的内容
  createdCode:any = []; //存放生成二维码的数据
  scannedCode:any ; //扫描二维码得到的数据
  title:string ="收款码" //标题
  qrURL:any; //扫码地址
  isETH:boolean; //eth/erc类型
  isBTC:boolean; //btc类型
  isERC:boolean; //HIT
  walletIndex:any; //当前钱包索引
  walletObject:any; //本地钱包数据
  BdcTrans:boolean; //BDC交易
  CurrencyType:string; //货币类型

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public navparams: NavParams,
    public navService:NativeService,) {
    
  }


  //页面加载完成后的初始二维码
  ionViewDidEnter(){
    this.createCode();
  }

  ionViewWillEnter(){
    this.qrURL=this.navparams.get('hash')
    this.walletIndex=this.navService.get('walletIndex')
    this.walletObject=this.navService.get('walletSql')
    
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

    /*获取货币类型*/
    this.CurrencyType=this.navparams.get('CurrencyType')

    /*根据不同货币类型显示货币账户地址*/
    switch (this.CurrencyType) {
      case "ETH":
        this.qrURL=this.walletObject[this.walletIndex].ETHaddress
        break;
      case "ERC":
        this.qrURL=this.walletObject[this.walletIndex].ETHaddress
        break;
      case "BTC":
        this.qrURL=this.walletObject[this.walletIndex].BTCaddress
        break;
      case "BdcTrans":
        this.qrURL=this.walletObject[this.walletIndex].BDCaddress
        break;
      default:
        // code...
        break;
    }
  }


  //二维码生成
  createCode() {

    // switch (this.CurrencyType) {
    //   case "ETH":
    //     this.qrURL=this.walletObject[this.walletIndex].ETHaddress
    //     break;
    //   case "ERC":
    //     this.qrURL=this.walletObject[this.walletIndex].ETHaddress
    //     break;
    //   case "BTC":
    //     this.qrURL=this.walletObject[this.walletIndex].BTCaddress
    //     break;
    //   case "BdcTrans":
    //     this.qrURL=this.walletObject[this.walletIndex].BDCaddress
    //     break;
    //   default:
    //     // code...
    //     break;
    // }
    
    
    if(this.qrData===null){
      this.qrData='0'
    }else{
      if(this.qrData.toString().length>18){
        this.qrData=this.qrData.toString().slice(18,19)
        alert("您输入的数额超过18位,请重新输入!")
      }
    }
    var params={
      "amount":this.qrData,
      "assetsAddress":this.qrURL,
      "walletAddress":this.qrURL,
      "CurrencyType":this.CurrencyType,
    }
    console.log(params)
    this.createdCode = JSON.stringify(params)
    console.log(this.createdCode)
  }

  //分享选择菜单
  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
      cssClass: 'action-sheets-basic-page iconSize',
      buttons: [
        {
          role: 'destructive',
          icon: 'contacts' ,
          handler: () => {
            console.log('Delete clicked');
          }
        },
        {
          role: 'destructive',
          icon: 'aperture' ,
          handler: () => {
            console.log('Delete clicked');
          }
        },
        {
          text: '取消',
          role: 'cancel', // will always sort to be on the bottom
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  //复制文本实现方法
  copy=this.navService.copy
}
