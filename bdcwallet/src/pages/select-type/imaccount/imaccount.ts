import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import EthereumJsWallet from 'ethereumjs-wallet';
import { Http,RequestOptions,Headers,Response } from '@angular/http';
import { HttpService } from '../../../servies/Http.service';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-imaccount',
  templateUrl: 'imaccount.html',
})
export class ImaccountPage {
	title:string; //标题
	accountType:string; //账户类型
	walletObject:any;  //本地钱包数据
	walletIndex:any; //当前钱包索引
	priKey:string; //私钥
	loading:any; //loading效果
  isComfire:boolean=false; //alert

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public navService:NativeService,
  	public loadingCtrl: LoadingController,
  	private http: Http,
    public toastCtrl: ToastController,
    public navHttpfun:HttpService,
  	) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImaccountPage');
  }

  ionViewWillEnter(){
    console.log(this.navService.get('walletIndex'))
    
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

    this.accountType=this.navParams.get('type')

    /*选择类型*/
    switch (this.accountType) {
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

  //导入账户
  Imaccount(){
  	this.walletObject=this.navService.get('walletSql')
  	this.walletIndex=this.navService.get('walletIndex')

  	switch (this.accountType) {
  		case "ETH":
  			if(this.walletObject[this.walletIndex].ETHaddress){
  				var str="钱包已有ETH账户"
          this.navService.presentToast(str)
  			}else{
  				const Buffer = require('buffer');
          var err=false;
           
          try{
             Buffer.Buffer.from(this.priKey, 'hex')
             const wallet = EthereumJsWallet.fromPrivateKey(Buffer.Buffer.from(this.priKey, 'hex'));
          }catch(error){
             err=error
          }
          if(err){
             var str="私钥格式不正确"
             this.navService.presentToast(str)
          }else{
            this.navService.show()
            const wallet = EthereumJsWallet.fromPrivateKey(Buffer.Buffer.from(this.priKey, 'hex'));
              

            /*默认ETH资产*/
            var ETH={'symbol':'ETH','balance':0,'rmb':0,'address':wallet.getAddressString(),'contractadr':'0x000000000000000',
               'name':'ether','img':'./assets/imgs/eth.png','selected':true}

            this.walletObject[this.walletIndex].ETHaddress=wallet.getAddressString()
            this.walletObject[this.walletIndex].ETHprivKey=this.priKey

            
            var walletAssets=this.navService.get('walletAssets')
            this.navService.addAssest(this.walletIndex,ETH,walletAssets,"walletAssets")
            /*资产列表*/
            // var assetsList=this.navService.getObject('assetsList')

            // /*当前钱包首页列表*/
            // var currentAssets=this.navService.getObject('currentAssets')

            // assetsList.push(ETH);
            // currentAssets.push(ETH);

            /*保存当前列表数据*/
            // this.navService.setObject('assetsList',assetsList)    
            // this.navService.setObject('currentAssets',currentAssets)
            //保存数组
            this.navService.set('walletSql',this.walletObject);

          	this.navService.hide()
          	//创建成功后,自动返回首页
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3))
  				}
  			}
        break;
      case "BTC":
      	if(this.walletObject[this.walletIndex].BTCaddress){
  				var str="钱包已有BTC账户"
          this.navService.presentToast(str)
  			}else{
  				var isError=false;
           try{
             const bitcoin = require("bitcoinjs-lib");
             const keyPair = bitcoin.ECPair.fromWIF(this.priKey)
           }catch(err){
             isError=err;
             console.log(err)
           }
           if(isError){
             var str="私钥格式不正确"
             this.navService.presentToast(str)
           }else{
             this.navService.show()
             //比特钱包创建接口参数
             const bitcoin = require("bitcoinjs-lib");
             // const Buffer = require('buffer');
             const keyPair = bitcoin.ECPair.fromWIF(this.priKey)
             const address  = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
             // var priKey=keyPair.toWIF();
             console.log(keyPair);


             /*默认BTC资产*/
            var BTC={'symbol':'BTC','balance':0,'rmb':0,'address':address.address,'contractadr':'0x000000000000000',
                   'name':'Bitcoin','img':'./assets/imgs/btc.png','selected':true}

            this.walletObject[this.walletIndex].BTCaddress=address.address
            this.walletObject[this.walletIndex].BTCprivKey=this.priKey

            var walletAssets=this.navService.get('walletAssets')
            this.navService.addAssest(this.walletIndex,BTC,walletAssets,"walletAssets")
            /*资产列表*/
            // var assetsList=this.navService.getObject('assetsList')

            /*当前钱包首页列表*/
            // var currentAssets=this.navService.getObject('currentAssets')

            // assetsList.push(BTC);
            // currentAssets.push(BTC);

            /*保存当前列表数据*/
            // this.navService.setObject('assetsList',assetsList)    
            // this.navService.setObject('currentAssets',currentAssets)  
            //保存数组
            this.navService.set('walletSql',this.walletObject);

             this.navService.hide()
            //创建成功后,自动返回首页
            this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3))
           }
  			}
        break;
      case "BDC":
      	if(this.walletObject[this.walletIndex].BDCaddress){
  				var str="钱包已有BDC账户"
          this.navService.presentToast(str)
  			}else{
      		/*正式环境 or 测试环境*/
      		var chainUrl=APP_SERVER_BDC+"/restapi/wallet/getWallet"

          /*获取邮箱数据*/
      		var mailStr=this.navService.get('mailStr')

      		if(mailStr===null || mailStr===undefined){
            this.showConfirm()
          }else{
            this.navService.show()

            /*解密钱包密码*/
            var unlockCode=this.navService.uncompileStr(this.walletObject[this.walletIndex].walletPsw)

            /*组装post数据*/
            var params={
                  privateKey:this.priKey,
                  code:unlockCode,
                  email:mailStr
                }
          //设置请求头,使参数以表单形式传递
          let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
          this.http.post(chainUrl,this.navHttpfun.toBodyString(params),new RequestOptions({headers: headers})).subscribe((res:Response)=>{
              var BDlist=res.json();
              console.log(BDlist)
              if(BDlist.return_code==="FAIL"){
                this.navService.hide()
                var str="私钥格式不正确"
                this.navService.presentToast(str)
              }else{
                BDlist=BDlist.return_data;

                this.walletObject[this.walletIndex].BDCaddress=BDlist.address;
                this.walletObject[this.walletIndex].BDCprivKey=this.priKey;

                /*默认BDC资产*/
                var BDC={'name':'BDC',trade:0,'icon':'./assets/imgs/bdlogo.png','selected':true,
                    'address':BDlist.address,'contractadr':'0x000000000000000',}

                var dappData=this.navService.get('dappData')
                this.navService.addAssest(this.walletIndex,BDC,dappData,"dappData")
                /*资产列表*/
                // var bdcAssetslist=this.navService.getObject('bdcApplist')

                /*当前钱包首页列表*/
                // var BDCcurrent=this.navService.getObject('currentApp')

                // bdcAssetslist.push(BDC)
                // BDCcurrent.push(BDC)

                // this.navService.setObject('bdcApplist',bdcAssetslist)
                // this.navService.setObject('currentApp',BDCcurrent)
               
                //保存数组
                this.navService.set('walletSql',this.walletObject);

                this.navService.hide()
                //创建成功后,自动返回首页
                this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3))
              }
            },(error:Response)=>{
              this.navService.hide()
              var str="导入失败"
              this.navService.presentToast(str)
            })
          }
  			}
        break;
      }
  }

  //弹出导入失败提示框
  showConfirm() {
    this.isComfire=true;
  }

  //隐藏导入失败提示框
  cancel(){
    this.isComfire=false;
  }

  //跳转到修改邮箱页面
  goEmail(){
    this.navCtrl.push('EmailPage')
  }


}
