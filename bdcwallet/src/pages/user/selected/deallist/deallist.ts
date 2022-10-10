import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController,ToastController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { NativeService } from '../../../../servies/Native.service';
import Web3 from 'web3';
import { SelectedPage } from '../../selected/selected/selected';
import { APP_SERVER_BDC,APP_SERVER_ETH,APP_SERVER_ETH_NODE } from '../../../../servies/common.HttpUrl';

@IonicPage()
@Component({
  selector: 'page-deallist',
  templateUrl: 'deallist.html',
})
export class DeallistPage {

	title:string; //标题
	dealList:any=[]; //eth接收数据列表
	ETHdealList:any=[]; //eth数据渲染列表
	walletInfo:any=[]; //本地钱包数据
	walletIndex:any; //当前钱包索引
	walletAddress:string; //当前钱包地址
  CurrencyType:string; //货币类型
	url:string; //请求数据url
  loading:any; //loading效果
  BitList:any=[]; //BTC余额
  balance:any; //余额
  rmb:string; //人民币
  comfireList:any=[]; //BTC数据列表
  BDCinfolist:any; //BDC类型数据列表
  BDCdataList:any=[]; //BDC页面渲染列表
  unit:string; //单位
  isERC:boolean=false; //是否是ERC资产
  type:string="ETH"; //选择的类型
  endLoad:boolean=false; //上拉加载显示状态
  addpages:any; //ETH加载页数
  before:string; //BTC交易分页标识
  BDCPages:any; //BDC分页加载
  integralPages:any; //BDC积分交易分页提示
  BTCcomfireList:any=[]; //BTC页面渲染列表
  btcendload:boolean=false; //btc加载完毕底部提示
  ethendload:boolean=false; //eth加载完毕底部提示
  BDCintegral:boolean=false; //BDC积分交易加载完毕底部提示
  integralList:any; //BDC积分交易数据列表
  integralRnder:any=[]; //BDC积分交易数据渲染列表
  BtcRate:any=100000000; //BTC转化率

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private http: Http,
  	public navService:NativeService,
  	public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeallistPage');
  }

  ionViewDidEnter(){
    this.walletInfo=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')
    this.title=this.walletInfo[this.walletIndex].walletName;


    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()

    /*渲染页面*/
    this.EnterRender(this.walletIndex)
  }



  ionViewWillLeave(){
  	//解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
  	this.navService.hide()

    /*初始化数据列表,防止退出再次返回时数据遗留bug*/
    this.comfireList=[];
    this.BTCcomfireList=[];
    this.ETHdealList=[];
    this.dealList=[];
    this.BDCinfolist=[];
    this.BDCdataList=[];
    this.integralList=[];
    this.integralRnder=[];
  }


  EnterRender(index){
    this.navService.show()
    this.walletInfo=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')
    this.title=this.walletInfo[index].walletName;

    /*判断是否仅有单个类型钱包*/
    if(this.walletInfo[this.walletIndex].ETHaddress && !this.walletInfo[this.walletIndex].BDCaddress && !this.walletInfo[this.walletIndex].BTCaddress){
      this.type="ETH"
    }
    if(this.walletInfo[this.walletIndex].BTCaddress && !this.walletInfo[this.walletIndex].ETHaddress && !this.walletInfo[this.walletIndex].BDCaddress){
      this.type="BTC"
    }
    if(this.walletInfo[this.walletIndex].BDCaddress && !this.walletInfo[this.walletIndex].ETHaddress && !this.walletInfo[this.walletIndex].BTCaddress){
      this.type="integral"
    }

    if(this.walletInfo[this.walletIndex].ETHaddress){
      this.addpages=1;
      this.renderList(this.addpages)
    }
    if(this.walletInfo[this.walletIndex].BTCaddress ){
      this.before=null
      this.renderBit(this.before)
    }
    if(this.walletInfo[this.walletIndex].BDCaddress){
      this.BDCPages=1
      this.renderBDC(this.BDCPages)
      this.integralPages=1
      this.integralBDC(this.integralPages)
    }
    this.navService.hide()
  }

   //顶部类型选择
  renderType(type){
    this.type=type;
  }

  //打开模态框页面
  presentModal() {
    const modal = this.modalCtrl.create('SelectedPage');
    modal.onDidDismiss(data => { //页面关闭获取选择的钱包索引
      /*选择钱包后初始化数据列表*/
      this.comfireList=[];
      this.BTCcomfireList=[];
      this.ETHdealList=[];
      this.dealList=[];
      this.BDCinfolist=[];
      this.BDCdataList=[];
      this.ethendload=false;
      this.btcendload=false;
      this.endLoad=false;
      this.BDCintegral=false;
      this.integralList=[];
      this.integralRnder=[];
      if(data!=null && data!=undefined){
        this.EnterRender(data);
      }
      
    });
    modal.present();
  }



  //ETH交易记录
  renderList(addpages){
    //以太环境配置
    var web3HttpProvider =new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE);


    const web3 = new Web3(web3HttpProvider);

    //以太请求 测试环境 or 正式环境
    this.url=APP_SERVER_ETH+"/api?module=account&action=txlist&address="+this.walletInfo[this.walletIndex].ETHaddress+"&page="+addpages+"&offset=20&sort=desc&apikey=WCHP3FTSVXD3X2P2DN2CKWRT5B61X624YS"
    
    this.http.request(this.url)
      .subscribe((res: Response) => {
        
        this.dealList=res.json();
        console.log(this.dealList);
        if(this.dealList.status!=0){
          this.dealList=this.dealList.result;
          // var infoList=[]
          var currentAsset=this.navService.getObject('unitList')
          // for(var n=0;n<this.dealList.length;n++){
          //   if(this.dealList[n].value===0){
          //     var isExist=this.forEach(this.dealList[n].to)
          //     if(isExist){
          //       infoList.push(this.dealList[n])
          //     }
          //   }else{
          //     infoList.push(this.dealList[n])
          //   }
          // }
          // this.dealList=infoList;
          console.log(this.dealList)
          for(var i=0;i<this.dealList.length;i++){
            this.dealList[i].value=parseFloat(this.dealList[i].value)
            if(this.dealList[i].value===0){
              var isOk=this.find(this.dealList[i].to)
              if(isOk){
                this.dealList[i].unit=currentAsset[isOk].symbol
                var value=this.dealList[i].value=this.dealList[i].input.slice(74)
                value=parseInt(value,16)
                this.dealList[i].decimals=currentAsset[isOk].decimals
                this.dealList[i].value=value/Math.pow(10,currentAsset[isOk].decimals);
                this.dealList[i].value=parseFloat(this.dealList[i].value).toLocaleString()
                this.dealList[i].Identification=true;
              }

            }else{
              this.dealList[i].unit="ether"
              //将单位转为以太货币类型
              this.dealList[i].value=web3.fromWei(this.dealList[i].value,'ether')
              this.dealList[i].value=this.dealList[i].value.toLocaleString()
            }
            //将时间戳转换为时间格式
            this.dealList[i].timeStamp=new Date(parseInt(this.dealList[i].timeStamp) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
                 
            //判断交易为进账或者出账
            if(this.dealList[i].from===this.walletInfo[this.walletIndex].ETHaddress){
              this.dealList[i].value="-"+this.dealList[i].value //出账
            }else{
              this.dealList[i].value="+"+this.dealList[i].value //进账
            }
            this.ETHdealList.push(this.dealList[i])
          }
            
        }else{
        	this.ethendload=true;
        }
      },(error:Response)=>{
        var str="网络出错"
        this.navService.presentToast(str)
      })
      
  }

  //遍历地址
  forEach(address){
    var currentAsset=this.navService.getObject('unitList')
    for(var i=0;i<currentAsset.length;i++){
      if(address===currentAsset[i].address){
        return true;
      }
    }
    return false;
  }

  //遍历地址,获取下标
  find(address){
    var currentAsset=this.navService.getObject('unitList')
    for(var i=0;i<currentAsset.length;i++){
      if(address===currentAsset[i].address){
        return i;
      }
    }
    return false;
  }

   //bit交易记录
  renderBit(before){
    var dealRUL="https://api.blockcypher.com/v1/btc/main/addrs/"+this.walletInfo[this.walletIndex].BTCaddress+"/full?limit=10&before="+before
    this.http.request(dealRUL).subscribe((res: Response) => {
      this.BitList=res.json()
      console.log(this.BitList)
      this.balance=this.BitList.balance/this.BtcRate;
      this.rmb=this.balance;
      this.comfireList=this.BitList.txs
      if(this.BitList.txs.length===0){
        this.btcendload=true;
      }else{
        for(var i=0;i<this.comfireList.length;i++){
        this.comfireList[i].total=0;
        if(this.comfireList[i].confirmed===null || this.comfireList[i].confirmed===undefined){
          this.comfireList[i].confirmed="交易正在处理"
        }
        this.comfireList[i].confirmed=new Date(this.comfireList[i].confirmed).getTime(); //将获取的时间格式转为时间戳
        this.comfireList[i].confirmed=this.comfireList[i].confirmed/1000
        /*将时间戳转为常见的时间格式*/
        this.comfireList[i].confirmed=new Date(parseInt(this.comfireList[i].confirmed) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
        if(this.comfireList[i].confirmed==="Invalid Date" || this.comfireList[i].confirmed===null || this.comfireList[i].confirmed===undefined){
          this.comfireList[i].confirmed="交易正在处理"
        }
        
        var isExist=this.forBTCEach(this.comfireList[i].inputs)
        if(isExist){ //收款
          for(var j=0;j<this.comfireList[i].outputs.length;j++){
            for(var n=0;n<this.comfireList[i].outputs[j].addresses.length;n++){ //inputs数组中的address数组
              //找到outputs中对应自己地址的金额,全部加起来为收款金额
              if(this.walletInfo[this.walletIndex].BTCaddress===this.comfireList[i].outputs[j].addresses[n]){ 
                this.comfireList[i].total=this.comfireList[i].total+this.comfireList[i].outputs[j].value;
              }  
            }
          }
          this.comfireList[i].total="+"+this.comfireList[i].total/this.BtcRate
        }else{  
          var inNumber=0;
          var outNumber=0;
          for(var j=0;j<this.comfireList[i].outputs.length;j++){
            for(var n=0;n<this.comfireList[i].outputs[j].addresses.length;n++){ //inputs数组中的address数组
              //将outputs中存在自己地址的金额全部加起来
              if(this.walletInfo[this.walletIndex].BTCaddress===this.comfireList[i].outputs[j].addresses[n]){ 
                outNumber=outNumber+this.comfireList[i].outputs[j].value;
              }  
            }
          }
          for(var j=0;j<this.comfireList[i].inputs.length;j++){
            for(var n=0;n<this.comfireList[i].inputs[j].addresses.length;n++){ //inputs数组中的address数组
              //将inputs中存在自己地址的金额全部加起来
              if(this.walletInfo[this.walletIndex].BTCaddress===this.comfireList[i].inputs[j].addresses[n]){ 
                inNumber=inNumber+this.comfireList[i].inputs[j].output_value;
              }  
            }
          }
          if(inNumber>outNumber){  //判断为收款或发款,inputs中金额大于outputs,则为发款
            //发款
            for(var j=0;j<this.comfireList[i].outputs.length;j++){
              for(var n=0;n<this.comfireList[i].outputs[j].addresses.length;n++){ //inputs数组中的address数组
                //找到outputs中对应自己地址的金额,全部加起来为发款金额
                if(this.walletInfo[this.walletIndex].BTCaddress!=this.comfireList[i].outputs[j].addresses[n]){ 
                  this.comfireList[i].total=this.comfireList[i].total+this.comfireList[i].outputs[j].value;
                }  
              }
            }
            this.comfireList[i].total="-"+this.comfireList[i].total/this.BtcRate
          }else{ 
            //收款
            for(var j=0;j<this.comfireList[i].outputs.length;j++){
              for(var n=0;n<this.comfireList[i].outputs[j].addresses.length;n++){ //inputs数组中的address数组
                //找到outputs中对应自己地址的金额,全部加起来为收款金额
                if(this.walletInfo[this.walletIndex].BTCaddress===this.comfireList[i].outputs[j].addresses[n]){ 
                  this.comfireList[i].total=this.comfireList[i].total+this.comfireList[i].outputs[j].value;
                }  
              }
            }
            this.comfireList[i].total="+"+this.comfireList[i].total/this.BtcRate
         }
        }
        this.BTCcomfireList.push(this.comfireList[i])
      }
      }
    },(error:Response)=>{
      var str="网络出错"
      this.navService.presentToast(str)
    })

  }

  //遍历当前钱包地址是否存在于inputs中的address数组中
  forBTCEach(Transfer){
    for(var i=0;i<Transfer.length;i++){
      for(var n=0;n<Transfer[i].addresses.length;n++){ //inputs数组中的address数组
        if(this.walletInfo[this.walletIndex].BTCaddress===Transfer[i].addresses[n]){ //判断当前钱包地址是否存在于inputs数组中
          return false; //存在
        }
      }
    }
    return true; //不存在则说明是收款方
  }

  //bdc应用交易记录
  renderBDC(pages){
    /*生产环境 or 测试环境*/
    var dealURL=APP_SERVER_BDC+"/restapi/wallet/transaction/"+this.walletInfo[this.walletIndex].BDCaddress+"/allTransactions?pageNum="+pages+"&pageSize=10"
    
    this.http.request(dealURL).subscribe((res:Response)=>{
      this.BDCinfolist=res.json()
      if(this.BDCinfolist.SUCCESS!="SUCCESS"){
        this.endLoad=true;
      }else{
        this.BDCinfolist=this.BDCinfolist.return_data.rows;
        for(var i=0;i<this.BDCinfolist.length;i++){
          if(this.BDCinfolist[i].status===0){
            this.BDCinfolist[i].status="成功"
          }else{
            this.BDCinfolist[i].status="失败"
          }
          this.BDCdataList.push(this.BDCinfolist[i])
        }
      }
    },(error:Response)=>{
      var str="网络出错"
      this.navService.presentToast(str)
    })
  }

  //BDC积分交易记录
  integralBDC(pages){
    this.integralList=[]
    /*生产环境 or 测试环境 */
    var getRecording=APP_SERVER_BDC+"/restapi/wallet/bdcTransferList?address="+this.walletInfo[this.walletIndex].BDCaddress+"&pageNum="+pages+"&pageSize=10"
    
    this.http.request(getRecording).subscribe((res:Response)=>{
      this.integralList=res.json()
      console.log(this.integralList)
      if(this.integralList.return_data.total===0){
        this.BDCintegral=true;
      }else{
        if(this.integralList.return_code==="SUCCESS"){
          this.integralList=this.integralList.return_data.data
          for(var i=0;i<this.integralList.length;i++){
            if(this.integralList[i].transferStatus==="确认中"){
              this.integralList[i].transactionHash="交易正在确认中..."
            }
            this.integralList[i].createTime=this.integralList[i].createTime/1000
            this.integralList[i].createTime=new Date(parseInt(this.integralList[i].createTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
            if(this.integralList[i].fromAddress===this.walletInfo[this.walletIndex].BDCaddress){
              this.integralList[i].integral="-"+this.integralList[i].integral
            }else{
              this.integralList[i].integral="+"+this.integralList[i].integral
            }
            this.integralRnder.push(this.integralList[i])
          }
        }
      }
    },(error:Response)=>{
      var str="网络出错"
      this.navService.presentToast(str)
    })
  }

  //ETH跳转到交易详情及参数传递
  goETHdeal(index){
    var hash;
    var decimals;
    var total;
    var Identification;
    var txreceipt_status;
    console.log(this.ETHdealList[index])
    hash=this.ETHdealList[index].hash
    decimals=this.ETHdealList[index].decimals
    Identification=this.ETHdealList[index].Identification
    txreceipt_status=this.ETHdealList[index].txreceipt_status
    this.CurrencyType="ETH"

    this.navCtrl.push('DealPage',{
      total:total,
      CurrencyType:this.CurrencyType,
      hash:hash,
      decimals:decimals,
      isERC:Identification,
      txreceipt_status:txreceipt_status
    })
  }

  //BTC跳转到交易详情及参数传递
  goDeal(index){
  	var hash;
    var total;
    hash=this.BTCcomfireList[index].hash
    total=this.BTCcomfireList[index].total
    this.CurrencyType="BTC"

    this.navCtrl.push('DealPage',{
      total:total,
      CurrencyType:this.CurrencyType,
      hash:hash,
    })
  }

  //跳转八斗类型交易详情及参数传递
  goBDdeal(index){
    this.navCtrl.push('DealPage',{
      logId:this.BDCdataList[index].logId,
      status:this.BDCdataList[index].status
    })
  }

  //跳转到BDC积分交易详情页面及参数传递
  integralDeal(index){
    this.CurrencyType="BdcTrans"
    this.navCtrl.push("DealPage",{
      hash:this.integralRnder[index].integralLogId,
      CurrencyType:this.CurrencyType,
    })
  }

  /** 上拉加载数据
   */
  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    setTimeout(() => {
      switch (this.type) {
        case "ETH":
          if(this.walletInfo[this.walletIndex].ETHaddress && !this.ethendload){
            this.addpages++;
            this.renderList(this.addpages);
          }
          break;
        case "BTC":
          if(this.walletInfo[this.walletIndex].BTCaddress && !this.btcendload){
            this.before=this.comfireList[this.comfireList.length-1].block_height
            this.renderBit(this.before)
          }
          break;
        case "BDC":
          if(this.walletInfo[this.walletIndex].BDCaddress && !this.endLoad){
            this.BDCPages++;
            this.renderBDC(this.BDCPages)
          }
          break;
        case "integral":
          if(this.walletInfo[this.walletIndex].BDCaddress && !this.BDCintegral){
            this.integralPages++;
            this.integralBDC(this.integralPages)
          }
          break
        default:
          // code...
          break;
      }
    	infiniteScroll.complete(); 
    }, 2000);
  }

}
