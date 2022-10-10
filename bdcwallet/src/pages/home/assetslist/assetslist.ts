import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController} from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response } from '@angular/http';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-assetslist',
  templateUrl: 'assetslist.html',
})
export class AssetslistPage {
	title:string="添加新资产" //标题
  isHeader:boolean; //header隐藏和显示
  walletIndex:any; //当前钱包索引
  assetsList:any; //本地钱包资产数据
  renderList:any=[]; //当前钱包资产列表
  currentAssets:any; //当前的钱包添加或减少资产
  listIndex:any; //需要删除的资产索引
  walletObject:any=[]; //本地钱包数据
  isERC:boolean=false;  //以太类型
  isBDC:boolean=false; //八斗类型
  bdcApplist:any=[]; //八斗类型需要存储在首页资产列表的数据
  appList:any; //应用列表
  renderBDClist:any=[]; //BDC类型应用列表
  currentApp:any=[]; //BDC首页资产应用显示
  walletAssets:any; //钱包普通资产列表对象
  dappData:any; //钱包BDC应用&资产

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http:Http,
    public toastCtrl: ToastController,) {
  }

  ionViewDidEnter(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

    this.walletIndex=this.navService.get('walletIndex');
    this.walletObject=this.navService.get('walletSql')

    this.walletAssets=this.navService.get('walletAssets')
    this.dappData=this.navService.get('dappData')

    console.log(this.bdcApplist)
    console.log(this.currentApp)
    

    //页面进来时显示header
    this.isHeader=true;

    if(this.walletObject[this.walletIndex].ETHaddress!=null && this.walletObject[this.walletIndex].ETHaddress!=undefined){
      this.isERC=true
    }

    if(this.walletObject[this.walletIndex].BTCaddress!=null && this.walletObject[this.walletIndex].BTCaddress!=undefined){
      this.isERC=true
    }

    this.assetsList=this.walletAssets[this.walletIndex]
    for(var i=0;i<this.assetsList.length;i++){ /*当前钱包拥有的ETH账户和BTC账户*/
        this.renderList.push(this.assetsList[i])
    }


    if(this.walletObject[this.walletIndex].BDCaddress!=null && this.walletObject[this.walletIndex].BDCaddress!=undefined){
      this.isBDC=true
      
      
      /*正式环境 or 测试环境*/
      var getAppURL=APP_SERVER_BDC+"/restapi/wallet/address/"+this.walletObject[this.walletIndex].BDCaddress+"/apps"
      var attachUrl = APP_SERVER_BDC+"/attach/action/attach/downloadFile.do?id="
      this.http.request(getAppURL).subscribe((res:Response)=>{
        this.appList=res.json()
        if(this.appList.return_code==="SUCCESS"){
          this.appList=this.appList.return_data
          console.log(this.appList)
          for(var i=0;i<this.appList.length;i++){ /*将获取到的应用存储到本地(本地未存储的情况下)*/
            
            var found=this.Inquire(this.appList[i].appId)
            if(found){
              this.appList[i].selected=false
              if(this.appList[i].icon===null){
                this.appList[i].icon="./assets/imgs/bdlogo.png"
              }else{
                this.appList[i].icon =attachUrl+ this.appList[i].icon;
              }
              this.navService.addAssest(this.walletIndex,this.appList[i],this.dappData,'dappData')
            }
          }
        }

        this.bdcApplist=this.dappData[this.walletIndex]
        for(var i=0;i<this.bdcApplist.length;i++){ /*当前钱包拥有的BDC应用或账户 */
            this.renderBDClist.push(this.bdcApplist[i])
        }

      },(error:Response)=>{
        this.bdcApplist=this.dappData[this.walletIndex]
        for(var i=0;i<this.bdcApplist.length;i++){ /*当前钱包拥有的BDC应用或账户 */
          if(this.bdcApplist[i].belong===this.walletIndex){
            this.renderBDClist.push(this.bdcApplist[i])
          }
        }
      })
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssetslistPage');
  }

  ionViewWillLeave(){
    //离开页面时隐藏header
    this.isHeader=false;

    /*
      保存选择的资产
    */
    for(var i=0;i<this.renderList.length;i++){
      if(this.renderList[i].selected===true){ /*选择的资产*/
        var isPush=this.forEach(this.renderList[i].address)
        this.walletAssets[this.walletIndex][isPush].selected=true
      }else{ /*未选择或被取消的资产*/
        var isSplice=this.forEach(this.renderList[i].address)
        this.walletAssets[this.walletIndex][isSplice].selected=false
      }
    }
    
    /*
      保存选择的应用
    */
    for(var i=0;i<this.renderBDClist.length;i++){
      if(this.renderBDClist[i].selected===true){ /*选择的应用或账户*/
        
        if(this.renderBDClist[i].appId!=null && this.renderBDClist[i].appId!=undefined){ /*应用*/
          var isAdd=this.forAppEach(this.renderBDClist[i].appId)

          this.dappData[this.walletIndex][isAdd].selected=true
        }else{  /*账户*/
          var isIncrease=this.Traversing(this.renderBDClist[i].address)
          this.dappData[this.walletIndex][isIncrease].selected=true
        }
      }else{ /*未选择的应用或被取消的应用或账户*/
       
        if(this.renderBDClist[i].appId!=null && this.renderBDClist[i].appId!=undefined){ /*应用*/
          var isDel=this.forAppEach(this.renderBDClist[i].appId)
          this.dappData[this.walletIndex][isDel].selected=false
        }else{ /*账户*/
          var isOut=this.Traversing(this.renderBDClist[i].address)
          this.dappData[this.walletIndex][isOut].selected=false
        }
      }
    }

    this.navService.set('walletAssets',this.walletAssets)
    this.navService.set('dappData',this.dappData)
    console.log(this.navService.getObject('currentAssets'))
    
    this.renderList=[];
    this.renderBDClist=[];
  }

  //查找当前被选中资产是否已在首页列表中
  forEach(address){
    var homeData=this.walletAssets[this.walletIndex]
	  for(var j=0;j<homeData.length;j++){
  	  if(address===homeData[j].address){
  			return j;
  	  }
    }
  }

  //查找当前被选中应用是否已在首页列表中
  forAppEach(appId){
    var dappHomeList=this.dappData[this.walletIndex]
    for(var j=0;j<dappHomeList.length;j++){
      if(appId===dappHomeList[j].appId){
        return j;
      }
    }
  }

  //查找当前应用是否已经在资产列表中
  Traversing(address){
    var dappHomeList=this.dappData[this.walletIndex]
    for(var i=0;i<dappHomeList.length;i++){
      if(dappHomeList[i].address===address){
        return i;
      }
    }
  }

  //查找应用是否已经存在
  Inquire(appId){
    var dappHomeList=this.dappData[this.walletIndex]
    for(var j=0;j<dappHomeList.length;j++){
      if(dappHomeList[j].appId!=undefined && dappHomeList[j].appId!=null){
        if(appId===dappHomeList[j].appId){
          return false
        }
      }
    }
    return true
  }

  //跳转到搜索新资产页面
  goSearch(){
  	this.navCtrl.push('SearchPage')
  }




}
