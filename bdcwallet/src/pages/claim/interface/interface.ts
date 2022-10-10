import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController} from 'ionic-angular';
import { Http, Response, } from '@angular/http';
import { NativeService } from '../../../servies/Native.service';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-interface',
  templateUrl: 'interface.html',
})
export class InterfacePage {
	title:string="接口"; //标题
	appId:any; //应用id
	token:string; //token地址
	portList:any=[]; //接口列表
  loading:any; //loading效果
  walletObject:any; //本地钱包数据
  walletIndex:any; //当前钱包索引

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private http:Http,
    public loadingCtrl: LoadingController,
    public navService:NativeService,
    public toastCtrl: ToastController,) {
  }

  ionViewWillLeave(){
    this.navService.hide()
  }

  ionViewDidEnter(){
    this.navService.show()
    this.appId=this.navParams.get('appId')
    this.token=this.navParams.get('token')
    this.walletObject=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')

    /*正式环境 or 测试环境*/
    var getURL=APP_SERVER_BDC+"/restapi/wallet/app/"+this.appId+"/interfaces"
    
    //获取应用接口列表
    this.http.request(getURL).subscribe((res:Response)=>{
      this.portList=res.json()
      console.log(this.portList)
      if(this.portList.return_code==="FAIL"){
        var str="当前接口无数据"
        this.navService.presentToast(str)
      }else{
        this.portList=this.portList.return_data
      }
      this.navService.hide()
    },(error:Response)=>{
      this.navService.hide()
      var str="获取列表失败"
      this.navService.presentToast(str)
    })
  }

  ionViewDidLoad(){
    var name=this.navParams.get('title')
    this.title=name+this.title;
  }


  //跳转到更改接口参数页面
  goModiparams(index){
    this.navCtrl.push('ModiparamsPage',{
      id:this.portList[index].id,
      type:this.portList[index].type,
      token:this.token,
      appId:this.appId,
      title:this.portList[index].name
    })
  }


  //跳转查看交易记录
  goDeallist(){

    this.navCtrl.push('AssetsinfoPage',{
      isBD:true,
        canEdit:false,// 是否显示共享按钮与用户数量
      hash:this.appId,
      BDCwallet:this.walletObject[this.walletIndex].BDCaddress,
        CurrencyType:"BdIntegral",
      // isETH:false,
      // isERC:false,
      // isBit:false,
      share:0,
      dealTitle:'交易记录',
      portSign:'interface',
    })
  }


}
