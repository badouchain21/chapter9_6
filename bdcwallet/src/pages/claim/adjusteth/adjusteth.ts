import { Component,ChangeDetectorRef} from '@angular/core';
import { IonicPage, NavController,ToastController, NavParams,LoadingController } from 'ionic-angular';
import { Http, Response, } from '@angular/http';
import Web3 from 'web3';
import { NativeService } from '../../../servies/Native.service';
import EthereumJsWallet from 'ethereumjs-wallet';
// import ProviderEngine from 'web3-provider-engine';
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet';
import ProviderSubprovider from 'web3-provider-engine/subproviders/provider';
import { APP_SERVER_ETH,APP_SERVER_ETH_NODE } from '../../../servies/common.HttpUrl';

@IonicPage()
@Component({
  selector: 'page-adjusteth',
  templateUrl: 'adjusteth.html',
})
export class AdjustethPage {
	title:string="以太调试"; //标题
	contractAdr:string; //合约地址
	dataList:any=[]; //合约数据列表
  hash:string; //交易hash
  dealList:any=null; //交易数据
  dealName:any; //交易数据键名数组
  paramList:any; //参数列表
  list:any; //返回数据
  walletIndex:any; //当前钱包索引
  walletObject:any=[]; //本地钱包数据列表
  find:boolean=false; //查询是否显示标识
  result:any=null; //调试结果
  isStr:boolean=false; //交易hash查询出错标识
  contractName:any; //合约名称
  isSearch:boolean=true; //搜索栏显示
  isBack:boolean=false; //返回按键显示
  selectValue:any; //选中接口
  isFind:boolean=false; //查询交易hash

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private http:Http,
    public toastCtrl: ToastController,
  	public loadingCtrl: LoadingController,
    public navService:NativeService,
    public changeDetectorRef:ChangeDetectorRef) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdjustethPage');
  }

  ionViewWillEnter(){
    this.walletObject=this.navService.get("walletSql")
    this.walletIndex=this.navService.get("walletIndex")
    
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

  }

  ionViewWillLeave(){
    this.isBack=false
  }


  //获取合约数据
  getContract(){
    this.navService.show()
    this.list=[]
  	/*以太请求 测试环境 or 正式环境*/
  	var contractUrl=APP_SERVER_ETH+"/api?module=contract&action=getabi&address="+this.contractAdr
    var getContractName=APP_SERVER_ETH+"/api?module=contract&action=getsourcecode&address="+this.contractAdr+"&apikey=YourApiKeyToken"

    //请求合约名字
    this.http.request(getContractName).subscribe((res:Response)=>{
      this.contractName=res.json()
      if(this.contractName.status==='1'){
        this.contractName=this.contractName.result[0]
        this.contractName=this.contractName.ContractName

        //请求接口数据
        this.http.request(contractUrl).subscribe((res:Response)=>{
          this.list=res.json()
          console.log(this.list)
          if(this.list.status==="1"){
            this.find=true;
            this.dataList=this.list.result;
            this.dataList=JSON.parse(this.dataList)
            for(var i=0;i<this.dataList.length;i++){ /*根据类型筛选不需要的方法*/
              if(this.dataList[i].type==="event" || this.dataList[i].type==="fallback" || this.dataList[i].type==="constructor"){
                this.dataList.splice(i,1)
                i=i-1;
              }
            }
            console.log(this.dataList)
           
            this.selectValue=0
            this.selectInterface()
          }else{
            this.navService.presentToast(this.list.result)
          }
         
        },(error:Response)=>{
          this.navService.hide()
          var str="网络出错"
        this.navService.presentToast(str)
        })
      }else{
        this.navService.presentToast(this.contractName.message)
      }
      this.navService.hide()
    },(error:Response)=>{
        this.navService.hide()
        var str="网络出错"
        this.navService.presentToast(str)
    })
  }


  //选择接口
  selectInterface(){
    this.result=false;
    this.dealList=false;
    var index=this.selectValue
    console.log(index)
    if(index==="demand"){ /*查询交易标识*/
       this.isFind=true;
       for(var i=0;i<this.dataList.length;i++){
          this.dataList[i].display=false;
      }
    }else{
      this.isFind=false;
      for(var i=0;i<this.dataList.length;i++){
        if(this.dataList[i]!=index){
          this.dataList[i].display=false;
        }
      }
      this.dataList[index].display=true;
    }
  }


  //调试
  test(index){
    var ETHassets=this.navService.getObject('currentAssets')
    var balance;
    for(var n=0;n<ETHassets.length;n++){
      if(ETHassets[n].address===this.walletObject[this.walletIndex].ETHaddress){
          balance=ETHassets[n].balance
      }
    }
    if(balance<=0){
      const toast = this.toastCtrl.create({
          message: '失败:钱包余额为0',
          duration: 1500
      });
      toast.present();
    }else{
      this.navService.show()
      var that=this;
      var inputArr =[];
      var isEmpty=true;
      var param ='';
      var web3 = require('web3');
      var type = this.dataList[index].type;
      console.log(type)
      var stateMutability = this.dataList[index].stateMutability;
      // var web;
      var engine;
      const ProviderEngine=require('web3-provider-engine')
      
      // if(typeof web3.currentProvider != 'undefined') {
      //   web3 = new Web3(web3.currentProvider);  
      // }else {
      var priKey=this.walletObject[this.walletIndex].ETHprivKey.slice(2)
      var wallet = EthereumJsWallet.fromPrivateKey(Buffer.from(priKey, 'hex') );

      //配置以太环境
      var web3HttpProvider =new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)


      // web = new Web3(web3HttpProvider);
      engine = new ProviderEngine();

      engine.addProvider(new WalletSubprovider(wallet, {}));
      
      engine.addProvider(new ProviderSubprovider(web3HttpProvider));

      engine.start();

      web3 = new Web3(engine);
        
      web3.eth.defaultAccount = wallet.getAddressString();
      

      for(var i=0;i<this.dataList[index].inputs.length;i++){
        if(this.dataList[index].inputs[i].value===null || this.dataList[index].inputs[i].value===undefined){
          var str="参数不能为空"
          this.navService.presentToast(str)
          isEmpty=false;
        }else{
          inputArr.push(this.dataList[index].inputs[i].value)
        }
      }
      if(isEmpty){
        var  contractABI = JSON.parse(this.list.result);// abiArr是通过上面请求获得的arr对象
        console.log(contractABI)
        var MyContract = web3.eth.contract(contractABI);
        console.log(MyContract)
        var myContractInstance = MyContract.at(this.contractAdr);
        console.log(myContractInstance)
        web3.eth.defaultAccount =this.walletObject[this.walletIndex].ETHaddress
        var object = {"gasPrice":200000,"gas" :5000000,};
        web3.eth.getGasPrice((error,suc)=>{
          if(error){
            that.navService.hide()
            engine.stop()
          }else{
            var gasPrice = suc
            object.gasPrice=gasPrice*1.1
            // 组装参数字符
            for(var i=0;i<inputArr.length;i++){
              param += "inputArr["+i+"],";
            }
            // var _this =this
            var name=this.dataList[index].name

            var returnData=function(data){
              console.log(data)
              that.result=data
              if(that.result===false){
                that.result="false";
              }
              that.changeDetectorRef.detectChanges();
              that.navService.hide()
            }
            //由于参数个数跟是动态的，所以使用eval方式调用
            if(stateMutability=='pure'||stateMutability=='view'||type=='constructor'||type =='event'){
              //假如stateMutability类型为pure或view  则调用call方法
              eval("myContractInstance."+name+".call("+param+"object,(error,suc)=>{if(error){ returnData(error)  }else{ returnData(suc)  } })")
             
            }else{    
              //其他则调用sendTransaction方法
              eval("myContractInstance."+name+".sendTransaction("+param+"object,(error,suc)=>{ if(error){  returnData(error) }else{  returnData(suc) }  })")
            }
            engine.stop()
          }

        })
      }
    }

  }


  //查找交易hash
  findHash(){
    this.dealList=[]
    var err;
    //配置以太环境环境
    var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE);
    
    const web3 = new Web3(web3HttpProvider);
    this.hash = this.hash.toString();  //将hash转为字符串
    try{
      this.dealList = web3.eth.getTransaction(this.hash);
    }catch(error){
      this.dealList="查询出错";
      this.isStr=true;
      err=error
    }
    if(!err){
      this.dealList = web3.eth.getTransaction(this.hash);
      if (this.dealList.timeStamp==="Invalid Date" || this.dealList.timeStamp===null || this.dealList.timeStamp===undefined) {
        this.dealList.timeStamp = "交易正在确认中..."
      } else {
        var time = web3.eth.getBlock(this.dealList.blockHash)
        time = time.timestamp
        //将时间戳转换为时间格式
        this.dealList.timeStamp = new Date(parseInt(time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
      }
      this.dealList.gasPrice = web3.fromWei(this.dealList.gasPrice, 'ether') //将wei单位转为ETH

      this.dealList.value = this.dealList.value.toString() //获取交易额
      this.dealList.value = web3.fromWei(this.dealList.value, 'ether')
      this.dealList.value=this.dealList.value.toLocaleString()
      this.dealName=Object.keys(this.dealList)
    }
  }

  //搜索栏显示
  search(){
    this.isSearch=false
  }

  //取消搜索栏
  cancelSearch(){
    this.isSearch=true;
    this.isBack=true;
  }

  //返回上一层页面
  upper(){
    this.navCtrl.pop()
  }

  //复制文本实现方法
  copy=this.navService.copy

  onSearchKeyUp(event){
    if("Enter"==event.key){
      this.getContract()
    }
  }


}
