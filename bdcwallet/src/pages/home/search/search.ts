import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { Http, Response, } from '@angular/http';
import { NativeService } from '../../../servies/Native.service';
import { HttpService } from '../../../servies/Http.service';
import { APP_SERVER_ETH } from '../../../servies/common.HttpUrl';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  content:string="添加"; //控制添加按钮文字
  isClass:boolean=true; //控制添加按钮样式
  path:string; //请求url
  search:string; //输入框得到的url
  dataList:any; //请求得到的数据
  isExist:boolean=false; //判断是否获取到数据
  isApp:boolean=false; //判断是否获取到应用信息
  assetsInfo:any;  //资产信息列表
  assetsDate:any=[]; //本地资产数据
  loading:any; //loading效果
  walletData:any=[]; //本地钱包数据
  walletIndex:any; //当前钱包索引
  appList:any; //获取八斗应用信息

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http: Http,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navHttpfun:HttpService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }


  //点击键盘上的搜索按钮事件,查找资产信息
  onSearchKeyUp(event){
    this.walletData=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')
    if("Enter"==event.key){  //搜索以太合约
      var string=this.search.substring(0,2)
      if(string!="0x"){
        // this.getBDC()
        var str="合约地址不正确"
        this.navService.presentToast(str)
      }else{
        this.getETHassets()
      }
    }
  }

  //获取资产信息
  getETHassets(){
      
    this.navService.show()
    this.path=APP_SERVER_ETH+'/getTokenInfo/'+this.search+'?apiKey=freekey'
    this.http.request(this.path).subscribe((res: Response) => {
      this.dataList=res.json(); //转化为json格式
      console.log(this.dataList)
      if(this.dataList===null || this.dataList===undefined || this.dataList.error){
        this.navService.hide()
        var str="找不到合约信息"
        this.navService.presentToast(str)
      }else{
        this.isExist=true;
        if(!this.dataList.image){ //请求中没有图片时,默认图片
          this.dataList.image='./assets/imgs/dai.png'
        }

        this.assetsInfo={'address':this.dataList.address,'symbol':this.dataList.symbol,'name':this.dataList.name,'contractadr':this.dataList.address,
            'img':this.dataList.image,'selected':false,'balance':0,'rmb':0,'decimals':this.dataList.decimals}
               
        this.isClass=true;
        this.content='添加'
        this.navService.hide()
      }
    },(error:Response)=>{
      this.navService.hide()
      var str="请重试"
      this.navService.presentToast(str)
    });
      
  }

  //BDC应用信息获取
  // getBDC(){
  //   this.navService.show()
  //   /*生产环境 or 测试环境 */
  //   var getUrl=this.formalHTTP+"/restapi/wallet/app/"+this.search+"/summary"
    
  //   //设置请求头,使参数以表单形式传递
  //   let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
  //   var params={
  //     address:this.walletData[this.walletIndex].BDCaddress,
  //   }
  //   this.http.post(getUrl,this.navHttpfun.toBodyString(params),new RequestOptions({headers:headers})).subscribe((res:Response)=>{
  //     this.navService.hide()
  //     var BDClist=res.json()
  //     console.log(BDClist)
  //     if(BDClist.return_code!="FAIL"){
  //       this.appList=BDClist.return_data;
  //       this.isApp=true
  //     }else{
  //       this.navService.presentToast(BDClist.return_msg)
  //     }
  //   },(error:Response)=>{
  //     this.navService.hide()
  //     var str="请重试"
  //     this.navService.presentToast(str)
  //   })
  // }

  //点击添加按钮事件
  add(){
    this.assetsDate=this.navService.get('walletAssets')
    var isEixst=true
    if(this.isClass===true){
      for(var i=0;i<this.assetsDate[this.walletIndex].length;i++){
        if(this.assetsInfo.address===this.assetsDate[this.walletIndex][i].address && this.assetsInfo.belong===this.assetsDate[this.walletIndex][i].belong){
          isEixst=false;
        }
      }
      if(isEixst){
        this.isClass=false;
        this.content='已添加';
        this.navService.addAssest(this.walletIndex,this.assetsInfo,this.assetsDate,'walletAssets')//将当前添加的资产存到本地资产列表中
      }else{
        var str="已存在此合约"
        this.navService.presentToast(str)
      }
    }else{
      this.isClass=true;
      this.content='添加'
    }
  }

  //返回新增资产页面
  goBack(){
  	this.navCtrl.pop()
  }

  ionViewWillLeave(){
  	//解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
  	this.navService.hide()
  }
}
