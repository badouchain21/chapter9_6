import { Component,} from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { NativeService } from '../servies/Native.service';
@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  rootPage:any='FirstusePage';
  title:string; //标题
  dealList:any=[]; //接收数据列表
  walletInfo:any=[]; //本地钱包数据
  walletIndex:any; //当前钱包索引
  walletAddress:string; //当前钱包地址
  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    public navService:NativeService,) {

    if(this.navService.get('Logined')){
      this.rootPage='LoginPage'
    }

    if(!this.navService.get('firstTo') && this.navService.get('loginPsw')!=null){
      this.rootPage='LoginPage'
    }


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}
