import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';


@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private platform: Platform,
    private iab: InAppBrowser,
    private appAvailability: AppAvailability,) {
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter(){
    //防止使用tabHide方法后底部tab隐藏
    this.navService.tabShow()
  }

  //跳转钱包列表页面
  goWalletcard(){
    this.navCtrl.push('WalletcardPage')
  }

  //跳转总交易列表页面
  goDeal(){
  	this.navCtrl.push('DeallistPage')
  }

  //跳转修改密码页面
  goModifypsw(){
    this.navCtrl.push('ModifypswPage',{modifyType:1})
  }

  //跳转帮助中心页面
  goHelpcenter(){
    this.navCtrl.push('HelpcenterPage')
  }

  //跳转关于我们页面
  goAboutus(){
    this.navCtrl.push('AboutusPage')
  }

  //跳转个人邮箱页面
  goEmailpage(){
    this.navCtrl.push('EmailPage')
  }

  //跳转到QQ
  linkQQ(){
    var app = '';
        if (this.platform.is('ios')) {
            app = 'mqq://';      /* QQ的Scheme URL */
        } else if (this.platform.is('android')) {
            app = 'com.tencent.mobileqq';     /* QQ的安卓包名 */
        }
        console.log(this.appAvailability)
        this.appAvailability.check(app)     /* 检测QQ是否已安装 */
        .then(
            (yes: boolean) => {
              this.iab.create('mqqwpa://im/chat?chat_type=wpa&uin=1595279962', '_system');    /* 打开QQ */
            },
            (no: boolean) => {
                /* 未安装，提示下载 */
                var str="未安装手机QQ"
                this.navService.presentToast(str)
            }
        );
  }
}
