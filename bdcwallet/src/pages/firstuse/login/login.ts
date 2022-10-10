import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController} from 'ionic-angular';
import { TabsPage } from '../../tabs/tabs';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
	title="登录"  //标题
  isCheck =true //设置密码输入可见时图标
  isDisplay=false //设置密码输入不可见时图标
  visibility:string="password"; //设置密码输入框类型,作用为密码是否可见
  loginPassword:String; //登录密码
  RMBURL:any="https://ali-waihui.showapi.com/waihui-transform?fromCode=USD&money=1&toCode=CNY" //请求人民币汇率URL
  RMBlist:any; //人民币汇率请求返回数据列表
  RMBexchangeRate:any; //人民币汇率
  bitRmb:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http: Http,
    public toastCtrl: ToastController,) {
  }

  ionViewWillEnter(){
    /*
      只执行一次,将旧版本中未进行加密的密码进行加密
    */
    if(this.navService.get("limit")!=false || this.navService.get('limit')===undefined || this.navService.get('limit')===null){
      var walletObject=this.navService.getObject('walletObject')
      for(var i=0;i<walletObject.length;i++){ /*钱包密码加密*/
        var lockPsw=this.navService.compileStr(walletObject[i].walletPsw)
        walletObject[i].walletPsw=lockPsw
      }
      var loginPsw=this.navService.get('loginPsw')
      var lockLogin=this.navService.compileStr(loginPsw)
      this.navService.set('loginPsw',lockLogin) /*登录密码加密*/
      this.navService.setObject('walletObject',walletObject)
      this.navService.set('limit',false) /*执行限制标识*/
    }
     

      if(this.navService.get('ChangeData')!=false || this.navService.get('ChangeData')===undefined || this.navService.get('ChangeData')===null){ //若是存在旧的钱包数据时进入
        /*新的数据逻辑(参照数关系型数据库)*/
        //创建一个存储钱包唯一标识uuid的数组对象
        this.navService.setObject('walletUuid',[])
        //创建一个存储钱包基础信息的对象
        this.navService.set('walletSql',{})
        //创建一个存储钱包资产信息的对象
        this.navService.set('walletAssets',{})
        //创建一个存储BDC资产&应用的对象
        this.navService.set('dappData',{})

        var uuidList=[] //创建一个临时存储新建uuid的数组
        var assetsList=this.navService.getObject('assetsList')
        var walletData=this.navService.getObject('walletObject')
        var walletAssets=this.navService.get('walletAssets')
        var dappData=this.navService.get('dappData')
        var currentAssets=this.navService.getObject('currentAssets')
        var bdcApplist=this.navService.getObject('bdcApplist')
        var currentApp=this.navService.getObject('currentApp')


        for(var i=0;i<walletData.length;i++){
          walletData[i].belong=i; //将钱包的下标记住
          var uuid=this.navService.storageUuid(walletData[i]) //将钱包的旧数据格式转化为新的格式
          uuidList.push(uuid) //将每个新格式的钱包uuid存储
        }

        if(assetsList!=undefined || assetsList.length>1){ //若钱包资产数据存在时进入
          for(var i=0;i<assetsList.length;i++){
            for(var n=0;n<currentAssets.length;n++){ //将显示在首页的资产作为新格式数据记录
              if(assetsList[i].address===currentAssets[n].address){
                assetsList[i].selected=true
              }
            }
          }

          for(var i=0;i<assetsList.length;i++){ //将钱包资产数据转为新格式数据

            for(var j=0;j<walletData.length;j++){
              if(assetsList[i].belong===walletData[j].belong){
                this.navService.addAssest(uuidList[j],assetsList[i],walletAssets,"walletAssets")
              }
            }
          }

        }

        if(bdcApplist!=undefined || bdcApplist.length>0){
          for(var i=0;i<bdcApplist.length;i++){

            for(var n=0;n<currentApp.length;n++){
              if(bdcApplist[i].appId===currentApp[n].appId){
                bdcApplist[i].selected=true
              }
              if(bdcApplist[i].address===currentApp[n].address){
                bdcApplist[i].selected=true
              }
            }

            for(var j=0;j<walletData.length;j++){
              if(bdcApplist[i].belong===walletData[j].belong){
                this.navService.addAssest(uuidList[j],bdcApplist[i],dappData,"dappData")
              }
            }
          }
        }

        this.navService.set('walletIndex',uuidList[0])
        this.navService.remove('assetsList') //删除旧的钱包资产数据在本地的存储
        this.navService.remove('walletObject') //删除旧的钱包数据在本地的存储
        this.navService.remove('currentAssets') //删除旧的首页显示资产列表
        this.navService.remove('bdcApplist') //删除旧的BDC在首页显示的资产列表
        this.navService.remove('currentApp') //删除旧的BDC在首页显示的应用列表
        this.navService.set('ChangeData',false)
      }

  }

  ionViewDidLoad() {
    let headers = new Headers({'authorization': 'APPCODE f17cb9b0ee7543c982a4a8993218726a'});
    //请求人民币汇率
    this.http.request(this.RMBURL,new RequestOptions({headers: headers}))
      .subscribe((res: Response) => {
        this.RMBlist = res.json(); //将得到的数据转化为json
        this.RMBexchangeRate=this.RMBlist.showapi_res_body.money; //赋予美元汇率
        this.navService.set('RMBexchangeRate',this.RMBexchangeRate);
    })
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

  goTabs(){
    console.log(this.navService.get('loginPsw'))
    /*解密登录密码*/
    var unLockPsw=this.navService.uncompileStr(this.navService.get('loginPsw'))
    console.log(unLockPsw)
    if(unLockPsw===this.loginPassword){
    	var iswallet=this.navService.getObject('walletObject')
    	if(iswallet.length===0){
				this.navCtrl.push('CrewalletPage')
    	}else{
				this.navCtrl.setRoot(TabsPage)
      }
    }else{
      this.loginPassword=null;
      var str="密码错误,请重新输入"
      this.navService.presentToast(str)
    }
  }

  //设置密码可见
  showicon(){
    this.isCheck=false;
    this.isDisplay=true;
    this.visibility="text";
  }

  //设置密码不可见
  hideicon(){
    this.isCheck=true;
    this.isDisplay=false;
    this.visibility="password";
  }


}
