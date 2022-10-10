import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { NativeService } from '../../../servies/Native.service';
import Web3 from 'web3';
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet';
import{ InAppBrowser } from'@ionic-native/in-app-browser';
import { APP_SERVER_BDC,APP_SERVER_ETH_NODE } from '../../../servies/common.HttpUrl';

@IonicPage()
@Component({
  selector: 'page-deal',
  templateUrl: 'deal.html',
})
export class DealPage {
  createdCode: any=null; //生成二维码内容
  title = '交易记录' //标题
  dealHash: string;  //交易hash
  dealInfoList: any = []; //交易记录数据列表
  isBit: boolean=false; //BTC交易标识
  total: any; //BTC交易金额
  isETH: boolean = true; //ETH交易标识
  send: any = []; //BTC交易发款方
  receipt: any = []; //BTC交易收款方
  walletInfo: any = []; //本地钱包数据
  walletIndex: any; //当前钱包索引
  logId: string; //BDClogID
  isBDC: boolean=false; //BDC应用标识
  JsonStr: any; //BDC数据渲染
  isinterfaceDesc: boolean = true; //BDC应用接口参数是否存在标识
  JsonValue: any; //JsonStr键名数组
  loading: any; //loading效果
  isLog: boolean = true; //失败日志状态
  isFail: boolean; //八斗类型交易失败状态
  isSuccess: boolean; //八斗类型交易成功状态
  BdcTrans:boolean=false; //BDC交易
  BdcDealList:any; //BDC积分交易数据列表
  CurrencyType:string; //货币类型
  integralSuccess:boolean=false; //积分交易成功状态
  integralFail:boolean=false; //积分交易失败状态
  txreceipt_status:string;
  ETHsuccess:boolean=false; //ETH交易成功状态
  ETHfail:boolean=false; //ETH交易失败状态
  decimals:any; //ERC进度
  BtcRate:any=100000000; //BTC转化率

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private http: Http,
    public navService: NativeService,
    public loadingCtrl: LoadingController,
    public myBrowser:InAppBrowser,
  ) {
  }

  //页面加载完成后的初始二维码
  ionViewWillLeave() {
    this.navService.hide()
  }

  //二维码生成
  createCode(qrString) {
    this.createdCode=qrString
  }

  ionViewWillEnter() {

    /*获取货币类型*/
    this.CurrencyType=this.navParams.get('CurrencyType')
    console.log(this.CurrencyType)
    
    /*获取传递参数*/
    this.dealHash = this.navParams.get('hash');
    this.total = this.navParams.get('total');
    this.logId = this.navParams.get('logId')
    this.txreceipt_status=this.navParams.get('txreceipt_status')
    this.decimals=this.navParams.get('decimals')

    /*获取本地钱包数据*/
    this.walletInfo = this.navService.get('walletSql')
    this.walletIndex = this.navService.get('walletIndex')

    if(this.txreceipt_status==="0"){
      this.ETHfail=true;
    }else{
      this.ETHsuccess=true;
    }
    this.navService.show()
    setTimeout(()=>{
      switch (this.CurrencyType) {
        case "ETH":
          this.renderETH()
          break;
        case "ERC":
          this.renderETH()
          break;
        case "BTC":
          this.renderBit()
          this.isETH = false;
          this.isBit=true
          break;
        case "BdcTrans":
          this.pointTransaction()
          this.BdcTrans=true
          this.isBDC=false;
          this.isETH=false
          this.isBit=false
          break;
        
        default:
          // code...
          break;
      }
      if (this.logId != null || this.logId != undefined) {
         this.renderBDC()
         this.isETH = false;
         this.isBDC = true;
       }

    },500)
  }

  //以太钱包交易记录信息
  renderETH() {
    
    //配置以太环境
    var web3HttpProvider =new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)

    const web3 = new Web3(web3HttpProvider);
    this.dealHash = this.dealHash.toString();  //将hash转为字符串
    this.dealInfoList = web3.eth.getTransaction(this.dealHash);
    console.log(this.dealInfoList)
    if (this.dealInfoList.blockNumber === null) {
      this.dealInfoList.timeStamp = "交易正在确认中..."
    } else {
      var time = web3.eth.getBlock(this.dealInfoList.blockHash)
      time = time.timestamp
      //将时间戳转换为时间格式
      this.dealInfoList.timeStamp = new Date(parseInt(time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
    }
    if (this.dealInfoList === null) {
      this.navService.hide()
      var str="网络出错"
      this.navService.presentToast(str)
    } else {
      this.dealInfoList.gasPrice = web3.fromWei(this.dealInfoList.gasPrice, 'ether') //将wei单位转为ETH

      if (this.navParams.get('isERC')) {
        var toAddress=this.dealInfoList.input.toString()
        toAddress=toAddress.substring(34,74)
        this.dealInfoList.to="0x"+toAddress
        var value = this.dealInfoList.value = this.dealInfoList.input.slice(74)
        value = parseInt(value, 16)
        
        value=value/Math.pow(10,this.decimals)
        this.dealInfoList.value=value
        this.dealInfoList.value=this.dealInfoList.value.toLocaleString()

        if (this.dealInfoList.timeStamp === "Invalid Date" || this.dealInfoList.timeStamp === null || this.dealInfoList.timeStamp === undefined) {
          this.dealInfoList.timeStamp = "交易正在确认中..."
        }
        if (this.dealInfoList.from === this.walletInfo[this.walletIndex].ETHaddress) {
          this.dealInfoList.value = "-" + this.dealInfoList.value //出账
        } else {
          this.dealInfoList.value = "+" + this.dealInfoList.value //进账
        }
      } else {
        this.dealInfoList.value = this.dealInfoList.value.toString() //获取交易额
        this.dealInfoList.value = web3.fromWei(this.dealInfoList.value, 'ether')
        this.dealInfoList.value=this.dealInfoList.value.toLocaleString()
        if (this.dealInfoList.from === this.walletInfo[this.walletIndex].ETHaddress) {
          this.dealInfoList.value = "-" + this.dealInfoList.value //出账
        } else {
          this.dealInfoList.value = "+" + this.dealInfoList.value //进账
        }
      }
      
      this.createCode(this.dealInfoList.hash)//生成二维码
      this.navService.hide()
    }
  }

  //比特钱包交易记录信息
  renderBit() {
    
    //请求URL
    var dealUrl = "https://api.blockcypher.com/v1/btc/main/txs/" + this.dealHash
    this.http.request(dealUrl)
      .subscribe((res: Response) => {
        this.dealInfoList = res.json()
        console.log(this.dealInfoList)
        this.dealInfoList.total = 0
        


        if (this.dealInfoList.confirmed === "Invalid Date" || this.dealInfoList.confirmed === null || this.dealInfoList.confirmed === undefined) {
          this.dealInfoList.confirmed = "交易正在处理"
        }
        this.dealInfoList.confirmed = new Date(this.dealInfoList.confirmed).getTime(); //将获取的时间格式转为时间戳
        this.dealInfoList.confirmed = this.dealInfoList.confirmed / 1000
        /*将时间戳转为常见的时间格式*/
        this.dealInfoList.confirmed = new Date(parseInt(this.dealInfoList.confirmed) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
        if (this.dealInfoList.confirmed === "Invalid Date" || this.dealInfoList.confirmed === null || this.dealInfoList.confirmed === undefined) {
          this.dealInfoList.confirmed = "交易正在处理"
        }

        var isExist=this.forEach(this.dealInfoList.inputs)
        if(isExist){ //收款
          console.log("isExist")
          for(var j=0;j<this.dealInfoList.outputs.length;j++){
            for(var n=0;n<this.dealInfoList.outputs[j].addresses.length;n++){ //inputs数组中的address数组
              //找到outputs中对应自己地址的金额,全部加起来为收款金额
              if(this.walletInfo[this.walletIndex].BTCaddress===this.dealInfoList.outputs[j].addresses[n]){ 
                this.dealInfoList.total=this.dealInfoList.total+this.dealInfoList.outputs[j].value;
              }  
            }
          }
          this.dealInfoList.total="+"+this.dealInfoList.total/this.BtcRate
          this.receipt=this.walletInfo[this.walletIndex].BTCaddress
          for(var j=0;j<this.dealInfoList.inputs.length;j++){
              for(var n=0;n<this.dealInfoList.inputs[j].addresses.length;n++){
                 if(this.dealInfoList.inputs[j].addresses[n]!=this.walletInfo[this.walletIndex].BTCaddress){
                   this.send=this.dealInfoList.inputs[j].addresses[n];
                   this.dealInfoList.inputs.length-1;
                   n=this.dealInfoList.inputs.length
                 }
              }
            }
        }else{  
          var inNumber=0;
          var outNumber=0;
          for(var j=0;j<this.dealInfoList.outputs.length;j++){
            for(var n=0;n<this.dealInfoList.outputs[j].addresses.length;n++){ //inputs数组中的address数组
              //将outputs中存在自己地址的金额全部加起来
              if(this.walletInfo[this.walletIndex].BTCaddress===this.dealInfoList.outputs[j].addresses[n]){ 
                outNumber=outNumber+this.dealInfoList.outputs[j].value;
              }  
            }
          }
          for(var j=0;j<this.dealInfoList.inputs.length;j++){
            for(var n=0;n<this.dealInfoList.inputs[j].addresses.length;n++){ //inputs数组中的address数组
              //将inputs中存在自己地址的金额全部加起来
              if(this.walletInfo[this.walletIndex].BTCaddress===this.dealInfoList.inputs[j].addresses[n]){ 
                inNumber=inNumber+this.dealInfoList.inputs[j].output_value;
              }  
            }
          }
          if(inNumber>outNumber){  //判断为收款或发款,inputs中金额大于outputs,则为发款
            //发款
            for(var j=0;j<this.dealInfoList.outputs.length;j++){
              for(var n=0;n<this.dealInfoList.outputs[j].addresses.length;n++){ //inputs数组中的address数组
                //找到outputs中对应自己地址的金额,全部加起来为发款金额
                if(this.walletInfo[this.walletIndex].BTCaddress!=this.dealInfoList.outputs[j].addresses[n]){ 
                  this.dealInfoList.total=this.dealInfoList.total+this.dealInfoList.outputs[j].value;
                }  
              }
            }
            this.dealInfoList.total="-"+this.dealInfoList.total/this.BtcRate
            this.send=this.walletInfo[this.walletIndex].BTCaddress
            for(var j=0;j<this.dealInfoList.outputs.length;j++){
              for(var n=0;n<this.dealInfoList.outputs[j].addresses.length;n++){
                 if(this.dealInfoList.outputs[j].addresses[n]!=this.walletInfo[this.walletIndex].BTCaddress){
                   this.receipt=this.dealInfoList.outputs[j].addresses[n];
                   this.dealInfoList.outputs.length-1;
                   n=this.dealInfoList.outputs.length
                 }
              }
            }
          }else{ 
            //收款
            for(var j=0;j<this.dealInfoList.outputs.length;j++){
              for(var n=0;n<this.dealInfoList.outputs[j].addresses.length;n++){ //inputs数组中的address数组
                //找到outputs中对应自己地址的金额,全部加起来为收款金额
                if(this.walletInfo[this.walletIndex].BTCaddress===this.dealInfoList.outputs[j].addresses[n]){ 
                  this.dealInfoList.total=this.dealInfoList.total+this.dealInfoList.outputs[j].value;
                }  
              }
            }
            this.dealInfoList.total="+"+this.dealInfoList.total/this.BtcRate
            this.receipt=this.walletInfo[this.walletIndex].BTCaddress
            for(var j=0;j<this.dealInfoList.inputs.length;j++){
              for(var n=0;n<this.dealInfoList.inputs[j].addresses.length;n++){
                console.log(this.dealInfoList.inputs[j].addresses[0])
                 if(this.dealInfoList.inputs[j].addresses[n]===this.walletInfo[this.walletIndex].BTCaddress){
                   this.send=this.dealInfoList.inputs[j].addresses[n];
                   this.dealInfoList.inputs.length-1;
                   n=this.dealInfoList.inputs.length
                 }
              }
            }
         }
        }
        this.createCode(this.dealInfoList.hash) //生成二维码
        this.navService.hide()
      }, (error: Response) => {
        this.navService.hide()
        var str="网络出错"
        this.navService.presentToast(str)
      })

  }

  //遍历当前钱包地址是否存在于inputs中的address数组中
  forEach(Transfer){
    for(var i=0;i<Transfer.length;i++){
      for(var n=0;n<Transfer[i].addresses.length;n++){ //inputs数组中的address数组
        if(this.walletInfo[this.walletIndex].BTCaddress===Transfer[i].addresses[n]){ //判断当前钱包地址是否存在于inputs数组中
          return false; //存在
        }
      }
    }
    return true; //不存在则说明是收款方
  }

  //八斗钱包交易记录信息
  renderBDC() {
    /*正式环境 or 测试环境*/
    var dealURL=APP_SERVER_BDC+"/restapi/wallet/transaction/"+this.logId+"/detail/"

    this.http.request(dealURL).subscribe((res: Response) => {
      this.dealInfoList = res.json();
      console.log(this.dealInfoList)

      this.dealInfoList = this.dealInfoList.return_data;
      if (this.dealInfoList.interfaceDesc === null || this.dealInfoList.interfaceDesc === undefined) {
        this.isinterfaceDesc = false;
      } else {
        this.isinterfaceDesc = true;
      }
      this.JsonStr = this.dealInfoList.params;
      this.JsonValue = Object.keys(this.JsonStr)
      this.dealInfoList.time = this.dealInfoList.time / 1000
      this.dealInfoList.time = new Date(parseInt(this.dealInfoList.time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
      if (this.dealInfoList.log === null) {
        this.isLog = false
      }
      if (this.dealInfoList.status != 0) {
        this.isFail = true;
        this.isSuccess = false;
      } else {
        this.isFail = false;
        this.isSuccess = true;
      }
      switch (this.dealInfoList.status) {
        case 0:
          this.dealInfoList.status = "成功"
          break;
        case 1:
          this.dealInfoList.status = "失败"
          break;
        case 2:
          this.dealInfoList.status = "开始"
          break;
        case 100:
          this.dealInfoList.status = "调用过于频繁"
          break;
        case 101:
          this.dealInfoList.status = "参数缺失 "
          break;
        case 102:
          this.dealInfoList.status = "参数值为空"
          break;
        case 103:
          this.dealInfoList.status = "参数解析错误"
          break;
        case 104:
          this.dealInfoList.status = "为空"
          break;
        case 105:
          this.dealInfoList.status = "token无效"
          break;
        case 106:
          this.dealInfoList.status = "应用不存在"
          break;
        case 107:
          this.dealInfoList.status = "接口不存在"
          break;
        case 108:
          this.dealInfoList.status = "接口被停用"
          break;
        case 109:
          this.dealInfoList.status = "没有权限"
          break;
        case 500:
          this.dealInfoList.status = "服务器内部错误"
          break;
        case 110:
          this.dealInfoList.status = "业务网络已停用或已过期"
          break;
        default:
          // code...
          break;
      }
      this.createCode(this.dealInfoList.hash)
      if (this.dealInfoList === null) {
        this.navService.hide()
        var str="无记录"
        this.navService.presentToast(str)
      }
      this.navService.hide()
    }, (error: Response) => {
      this.navService.hide()
      var str="网络出错"
      this.navService.presentToast(str)
    })

  }

  //BDC积分交易
  pointTransaction(){
    /*正式环境 or 测试环境*/
    var dealUrl=APP_SERVER_BDC+"/restapi/wallet/bdcTransferDetail?integralLogId="+this.dealHash

    this.http.request(dealUrl).subscribe((res:Response)=>{
      this.BdcDealList=res.json()
      console.log(this.BdcDealList)
      if(this.BdcDealList.return_code==="SUCCESS"){
        this.BdcDealList=this.BdcDealList.return_data
        if(this.BdcDealList.fromAddress===this.walletInfo[this.walletIndex].BDCaddress){
          this.BdcDealList.integral="-"+this.BdcDealList.integral
        }else{
          this.BdcDealList.integral="+"+this.BdcDealList.integral
        }
        
        if(this.BdcDealList.transferStatus==="成功"){
          this.createCode(this.BdcDealList.transactionHash)
          this.integralSuccess=true;
        }else if(this.BdcDealList.transferStatus==="失败"){
          this.integralFail=true;
          this.BdcDealList.transactionHash="失败"
        }else{
          this.integralSuccess=true;
          this.BdcDealList.transactionHash="交易正在确认中..."
        }
        
      }
      this.navService.hide()
    },(error:Response)=>{
      this.navService.hide()
      var str="网络出错"
      this.navService.presentToast(str)
    })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DealPage');
  }

  //跳转到比特浏览器
  jumpBrowerbtc(){
    //跳转到浏览器添加提示,确认是否跳转(提示功能预留)

    var browser=this.myBrowser.create('https://btc.com/');

    browser.show()
  }

  //跳转到以太坊浏览器
  jumpBrowereth(){
    //跳转到浏览器添加提示,确认是否跳转(提示功能预留)

    var browser=this.myBrowser.create('https://etherscan.io/');

    browser.show()
  }

  //跳转到八斗浏览器
  jumpBrowerbdc(){
    //跳转到浏览器添加提示,确认是否跳转(提示功能预留)

    var browser=this.myBrowser.create(this.dealInfoList.explorerUrl);

    browser.show()
  }

  //积分交易跳转浏览器
  jumpIntegralBdc(){
    //跳转到浏览器添加提示,确认是否跳转(提示功能预留)

    var browser=this.myBrowser.create(this.BdcDealList.explorerUrl)
    browser.show()
  }


  //复制文本实现方法
  copy=this.navService.copy

}
