import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response, } from '@angular/http';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-claim',
  templateUrl: 'claim.html',
})
export class ClaimPage {
	title:string="应用"; //标题
	isBDC:boolean=false; //判断当前钱包是否属于八斗类型  
	walletObject:any; //本地钱包数据
	walletIndex:any;  //当前钱包索引
	scannedCode = null; //扫描二维码得到的数据
	applist:any; //应用列表
	loading:any; //加载效果
  heatlist:any=[]; //热度列表
  isAdjust:boolean=false; //以太调试功能入口是否显示
  isIPFS:boolean=false; //IPFS功能入口是否显示
  noClaim:boolean; //无应用时整块隐藏
  adjustName:string;
  ipfsName:string;

  constructor(
  	public navCtrl: NavController,
  	public navParams: NavParams,
  	public navService:NativeService,
  	private http:Http,
  	public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,) {
  }

  ionViewDidEnter() {
    this.getClaim()
    this.getData()

  }

  //获取数据
  getData(){
  	this.applist=[]; //初始化渲染列表

    if(!this.isBDC){
	    /*正式环境 or 测试环境 */
	    var getURL=APP_SERVER_BDC+"/restapi/wallet/app/sharedApps"
	    this.http.request(getURL).subscribe((res:Response)=>{
	      this.applist=res.json()
	      this.applist=this.applist.return_data.rows
	      console.log(this.applist)
	      for(var i=0;i<this.applist.length;i++){
	        if(this.applist[i].icon===null || this.applist[i].icon===undefined){
	          this.applist[i].icon='./assets/imgs/bdlogo.png'
	        }else{
	          this.applist[i].icon=APP_SERVER_BDC+"/attach/action/attach/downloadFile.do?id="+this.applist[i].icon
	        }
          this.applist[i].hot=Math.round(this.applist[i].hot)
          if(this.applist[i].hot<1){
            this.applist[i].hot=1
          }
	      }
	    },(error:Response)=>{

	    })
	  }
  }

  //获取应用
  getClaim(){
     /*正式环境 or 测试环境 */
     var getClaimInfo=APP_SERVER_BDC+"/restapi/wallet/walletapp/inUseWalletApp"

     this.http.request(getClaimInfo).subscribe((res:Response)=>{
       var ClaimList=res.json()
       if(ClaimList.return_code==="SUCCESS"){
         var isClaim=false
         for(var i=0;i<ClaimList.return_data.length;i++){
           switch (ClaimList.return_data[i].walletAppValue) { //遍历功能入口
             case "AdjustethPage":
               this.isAdjust=true
               this.adjustName=ClaimList.return_data[i].walletAppName
               isClaim=true
               break;
             case "IpfsVedioPage":
               this.isIPFS=true;
               this.ipfsName=ClaimList.return_data[i].walletAppName
               isClaim=true
               break;
             default:
               // code...
               break;
           }
         }
         if(isClaim){
           this.noClaim=true;
         }else{
           this.noClaim=false
         }
       }else{
         var str="获取应用信息出错"
         this.navService.presentToast(str)
       }
     },(error:Response)=>{

     })
  }

  ionViewWillEnter(){
    //防止使用tabHide方法后底部tab隐藏
    this.navService.tabShow()

  	this.walletObject=this.navService.get('walletSql')
  	this.walletIndex=this.navService.get('walletIndex')

  	this.isBDC=false; //初始化显示状态

  	if(this.walletObject[this.walletIndex].BDCaddress){ //判断当前钱包是否存在BDC类型
  		this.isBDC=false;
  	}else{
      this.isBDC=true;
    }
  }

  getKeys(item){
    for(var i=0;i<item;i++){
      this.heatlist[i]=''
    }
    return this.heatlist
  }


  //跳转以太调试页面
  goAdjust(){
    if(this.walletObject[this.walletIndex].ETHaddress){
      console.log("1")
      this.navCtrl.push('AdjustethPage')
    }else{
      var str="钱包中需要有一个ETH账户才能使用此功能"
      this.navService.presentToast(str)
    }
  }
  

  //跳转应用接口列表页面
  goInterface(index){
  	this.navCtrl.push('InterfacePage',{
  		title:this.applist[index].name,
  		appId:this.applist[index].appId,
  		token:this.applist[index].token
  	})
  }

  //跳转ipfs
  goIpfs(){
    this.navCtrl.push('IpfsVedioPage')
  }

  //下拉刷新数据
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
    	this.getData()
      refresher.complete();
    }, 2000);
  }

}
