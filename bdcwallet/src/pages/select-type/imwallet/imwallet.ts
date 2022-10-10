import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ActionSheetController,LoadingController,ToastController } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { TabsPage } from '../../tabs/tabs';
import EthereumJsWallet from 'ethereumjs-wallet';
import { Http,RequestOptions,Headers,Response } from '@angular/http';
import { HttpService } from '../../../servies/Http.service';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-imwallet',
  templateUrl: 'imwallet.html',
})
export class ImwalletPage {
	walletObject:any; //获取本地存储钱包数据的对象数组
	priKey:any; //从输入框获取的私钥
  Name:String=null; //钱包名称
	Psw:String; //密码
	rePsw:String; //重复密码
	pswTip:String; //密码提示信息
	walletDate:any; //搜索获取到的钱包数据
  isCheck:boolean=true; //检查勾选协议状态,未勾选
  noCheck:boolean=false; //检查勾选协议状态未勾选
  isCre:boolean=false; //按钮处于可点击状态
  noCre:boolean=true; //按钮处于不可点击状态
  walletType:string; //钱包类型
  loading:any; //loading效果
  isComfire:boolean=false; //alert
  isFirst:boolean=true; //是否第一次使用,控制密码输入框显示
  title:string; //标题

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public navService:NativeService,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private http: Http,
    public toastCtrl: ToastController,
    public navHttpfun:HttpService,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImwalletPage');
  }

  ionViewWillEnter(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

    this.walletType=this.navParams.get('type')


    switch (this.walletType) {
      case "ETH":
        this.title="导入ETH私钥"
        break;
      case "BTC":
        this.title="导入BTC私钥"
        break;
      case "BDC":
        this.title="导入BDC私钥"
        break;
      default:
        // code...
        break;
    }
  }

  //调用接口,导入钱包
  Imwallet(){
    var verification=/^\d+$/; /*用以验证密码是否为纯数字*/

    if(this.Name===null){
      var str="必须填写钱包名称"
      this.navService.presentToast(str)
    }else{
      if(this.Psw!=this.rePsw){
        var str="密码与确认密码不一致"
        this.navService.presentToast(str)
      }else if(this.Psw.length<6){
        var str="密码长度必须是6位"
        this.navService.presentToast(str)
      }else if(!verification.test(this.Psw.toString())){
        var str="密码只能是6位数字"
        this.navService.presentToast(str)
      }else{
        /*加密钱包密码*/
        var lockWalletPsw=this.navService.compileStr(this.Psw)

        this.imSelect(lockWalletPsw)
      }
    }

    
  }

  //根据私钥类型选择导入钱包
  imSelect(walletPsw){
    /*根据选择的私钥类型*/
    switch (this.walletType) {
      case "ETH":
        const Buffer = require('buffer');
        var err;
               
        try{
          Buffer.Buffer.from(this.priKey, 'hex')
          const wallet = EthereumJsWallet.fromPrivateKey(Buffer.Buffer.from(this.priKey, 'hex'));
        }catch(error){
          err=error
        }

        if(err){
          var str="您的私钥格式不正确"
          this.navService.presentToast(str)
        }else{
          this.navService.show()
          const wallet = EthereumJsWallet.fromPrivateKey(Buffer.Buffer.from(this.priKey, 'hex'));
                  
          //新增钱包数
          var newData={'walletName':this.Name,'walletPsw':walletPsw,
              'ETHprivKey':wallet.getPrivateKeyString(),'ETHaddress':wallet.getAddressString(),
              'totalAssets':0,'integral':0,'force':0};

          /*默认ETH资产*/
          var ETH={'symbol':'ETH','balance':0,'rmb':0,'address':wallet.getAddressString(),'contractadr':'0x000000000000000',
                   'name':'ether','img':'./assets/imgs/eth.png','selected':true}

          var uuid=this.navService.storageUuid(newData)
          var walletAssets=this.navService.get('walletAssets')
          this.navService.addAssest(uuid,ETH,walletAssets,"walletAssets")
          /*资产列表*/
          // var assetsList=this.navService.getObject('assetsList')

          /*当前钱包首页列表*/
          // var currentAssets=this.navService.getObject('currentAssets')

          // assetsList.push(ETH);
          // currentAssets.push(ETH);


          /*保存当前列表数据*/
          // this.navService.setObject('assetsList',assetsList)    
          // this.navService.setObject('currentAssets',currentAssets)  

          //往数组添加新增钱包数据
          // this.walletObject.push(newDate);
          
          //保存数组
          // this.navService.setObject('walletObject',this.walletObject);
          this.navService.hide()

          /*导入成功*/
          var str="导入成功"
          this.navService.presentToast(str)

          //创建成功后,自动返回首页
          if(this.navService.get('firstRender')){
            this.navCtrl.setRoot(TabsPage);
          }else{
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-4))
          }
          if(this.navService.get('firstTo')){
            var walletuuid=this.navService.getObject('walletUuid')
            this.navService.set('walletIndex',walletuuid[0])
          }
        }
        break;
      case "BTC":
        var isError=false;
        try{
          const bitcoin = require("bitcoinjs-lib");
          const keyPair = bitcoin.ECPair.fromWIF(this.priKey)
        }catch(err){
          isError=err;
        }
        if(isError){
          var str="您的私钥格式不正确"
          this.navService.presentToast(str)
        }else{
          this.navService.show()

          //比特钱包创建接口参数
          const bitcoin = require("bitcoinjs-lib");
          // const Buffer = require('buffer');
          const keyPair = bitcoin.ECPair.fromWIF(this.priKey)
          const address  = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
          // var priKey=keyPair.toWIF();

          //新增钱包数据
          var newWallet={
                        'walletName':this.Name,
                        'walletPsw':walletPsw,
                        'BTCprivKey':this.priKey,
                        'BTCaddress':address.address,
                        'totalAssets':0,
                        'integral':0,
                        'force':0
                      };

           /*默认BTC资产*/
          var BTC={
                  'symbol':'BTC',
                  'balance':0,
                  'rmb':0,
                  'address':address.address,
                  'contractadr':'0x000000000000000',
                  'name':'Bitcoin',
                  'img':'./assets/imgs/btc.png',
                  'selected':true
                }


          var uuid=this.navService.storageUuid(newWallet)
          var walletAssets=this.navService.get('walletAssets')
          this.navService.addAssest(uuid,BTC,walletAssets,"walletAssets")
          /*资产列表*/
          // var assetsList=this.navService.getObject('assetsList')

          /*当前钱包首页列表*/
          // var currentAssets=this.navService.getObject('currentAssets')

          // assetsList.push(BTC);
          // currentAssets.push(BTC);

          /*保存当前列表数据*/
          // this.navService.setObject('assetsList',assetsList)    
          // this.navService.setObject('currentAssets',currentAssets)  

          //往数组添加新增钱包数据
          // this.walletObject.push(newWallet);
          //保存数组
          // this.navService.setObject('walletObject',this.walletObject);
          this.navService.hide()

          /*导入成功*/
          var str="导入成功"
          this.navService.presentToast(str)
                 
          //创建成功后,自动返回首页
          if(this.navService.get('firstRender')){
            this.navCtrl.setRoot(TabsPage);
          }else{
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-4))
          }
          if(this.navService.get('firstTo')){
            var walletuuid=this.navService.getObject('walletUuid')
            this.navService.set('walletIndex',walletuuid[0])
          }
        }
        break;
      case "BDC":
        /*正式环境 or 测试环境*/
        var chainUrl=APP_SERVER_BDC+"/restapi/wallet/getWallet"

        var mailStr=this.navService.get('mailStr')
        if(mailStr===null || mailStr===undefined){
          this.showConfirm()
        }else{
          this.navService.show()

          /*组装post数据*/
          var params={
                privateKey:this.priKey,
                code:this.Psw,
                email:mailStr
              }

          //设置请求头,使参数以表单形式传递
          let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
          this.http.post(chainUrl,this.navHttpfun.toBodyString(params),new RequestOptions({headers: headers})).subscribe((res:Response)=>{
            var BDlist=res.json();
            console.log(BDlist)
            if(BDlist.return_code==="FAIL"){
              this.navService.hide()
              this.navService.presentToast(BDlist.return_msg)
            }else{
              BDlist=BDlist.return_data;

              //新增钱包数据
              var newWallet={
                            'walletName':this.Name,
                            'walletPsw':walletPsw,
                            'BDCprivKey':BDlist.privateKey,
                            'BDCaddress':BDlist.address,
                            'totalAssets':0,
                            'integral':0,
                            'force':0,
                            email:BDlist.email
                          };

              /*默认BDC资产*/
              var BDC={
                      'name':'BDC',
                      trade:0,
                      'icon':'./assets/imgs/bdlogo.png',
                      'selected':true,
                      'address':BDlist.address,
                      'contractadr':'0x000000000000000',
                      email:BDlist.email
                    }

              var uuid=this.navService.storageUuid(newWallet)
              var dappData=this.navService.get('dappData')
              this.navService.addAssest(uuid,BDC,dappData,"dappData")

              /*资产列表*/
              // var bdcAssetslist=this.navService.getObject('bdcApplist')

              /*当前钱包首页列表*/
              // var BDCcurrent=this.navService.getObject('currentApp')

              // bdcAssetslist.push(BDC)
              // BDCcurrent.push(BDC)

              // this.navService.setObject('bdcApplist',bdcAssetslist)
              // this.navService.setObject('currentApp',BDCcurrent)
                  
              //往数组添加新增钱包数据
              // this.walletObject.push(newWallet);
              //保存数组
              // this.navService.setObject('walletObject',this.walletObject);
              this.navService.hide()

              /*导入成功*/
              var str="导入成功"
              this.navService.presentToast(str)

              var walletuuid=this.navService.getObject('walletUuid')
              //创建成功后,自动返回首页
              if(this.navService.get('firstRender')){
                this.navService.set('walletIndex',walletuuid[0])
                this.navCtrl.setRoot(TabsPage);
              }else{
                this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-4))
              }
              if(this.navService.get('firstTo')){
                this.navService.set('walletIndex',walletuuid[0])
              }
            }
          },(error:Response)=>{
            this.navService.hide()
            var str="导入失败"
            this.navService.presentToast(str)
          })
        }
        break;
      default:
        // code...
        break;
    }
  }


  //弹出创建失败提示框
  showConfirm() {
    this.isComfire=true;
  }

  //隐藏创建失败提示框
  cancel(){
    this.isComfire=false;
  }

  //跳转到邮箱绑定页面
  goEmail(){
    this.navCtrl.push('EmailPage')
  }

  ionViewWillLeave(){
  	//解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
  	this.navService.hide()
  }

  //打开服务协议页面
   jumpPage(){
     var serveURL=APP_SERVER_BDC+"/editrecord/editrecordlist/getHtmlContent.do?type=4"
     this.http.request(serveURL).subscribe((res:Response)=>{
       var content=res.json()
       content=content.bean
       this.navCtrl.push('ContentPage',{
         content:content,
       })
     })
   }

  //检查是否勾选协议,若未勾选,则不允许创建
  check(){
     if(this.isCheck){
       this.noCheck=true;
       this.isCheck=false;
       this.isCre=true;
       this.noCre=false;
     }else{
       this.noCheck=false;
       this.isCheck=true;
       this.isCre=false;
       this.noCre=true;
     }
   }
}
