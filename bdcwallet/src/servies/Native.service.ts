import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController  } from 'ionic-angular';

declare function escape(s:string):string;
declare function unescape(s:string):string;

/**
 * 网络操作
 * @description
 */
@Injectable()
export class NativeService {
  loading: any; //loading效果

  constructor(private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController) {   
  }



/* localhostStorage 本地存储------------------------------------------------*/
  /**
   * 存储单个属性
   */
  set(key: string, value: any) {
    if (value) {
      value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
  }
  /**
   * 读取单个属性
   */
  get<T>(key: string): T {
    let value: string = localStorage.getItem(key);

    if (value && value != "undefined" && value != "null") {
      return <T>JSON.parse(value);
    }

    return null;
  }
  /**
   * 存储对象，以JSON格式存储
   */
  setObject(key: string, value: any){
    localStorage[key] = JSON.stringify(value);
  }
  /**
   * 读取对象
   */
  getObject(key){
    return JSON.parse(localStorage[key] || '{}');
  }
  /**
   * 删除某个存储
   */
  remove(key: string) {
    localStorage.removeItem(key);
  }
  /**
   * 清空本地存储
   */
  clear() {
    localStorage.clear();
  }




  /*
   * Basic Alerts
   */
  showAlert(o, callback?:Function) {
    let alert = this.alertCtrl.create({
      title: o.title,
      subTitle: o.subTitle,
      message: o.message,
      buttons: [o.btxt ? {
        text: o.btxt ? o.btxt : '确定',
        handler: () => {
          console.log('Disagree clicked');
          callback ? callback() : '';
        }
      } : '']
    });
    alert.present();
    return alert;
  }

  /*新建钱包，创建相应的uuid，存储到本地*/
  /*
    walletData 新的钱包数据
  */
  storageUuid(walletData){
    var uuid=this.guid() //获取uuid
    var walletUuid=this.getObject('walletUuid') //获取本地存储uuid数组
    walletUuid.push(uuid) //将新的钱包的uuid存到本地
    this.setObject('walletUuid',walletUuid) //存储后保存新的uuid数组
    console.log(uuid)
    var walletSql=this.get('walletSql') //获取本地存储钱包数据的对象
    walletSql[uuid]=walletData //将新的钱包数据存入本地
    this.set('walletSql',walletSql) //保存添加新钱包后的对象
    return uuid;
  }

  /*钱包添加资产*/
  /*
    identity 钱包唯一标识
    assetsData 资产数据
    dataList 存储用到的数据对象
    dataStr 存储用到的数据对象在本地的名称
  */
  addAssest(identity,assetsData,dataList,dataStr){
    /*判断是否为第一次添加资产 若为第一次添加 根据钱包唯一标识创建一个数组*/
    if(dataList[identity]===null || dataList[identity]===undefined){
      dataList[identity]=[] 
    }
    dataList[identity].push(assetsData) //将资产添加到对应的钱包下
    this.set(dataStr,dataList) //保存数据
  }

  /*删除钱包*/
  /*
    identity 钱包唯一标识
  */
  deleteWallet(identity){
    var walletUuid=this.getObject('walletUuid')
    var walletSql=this.get('walletSql')
    var walletAssets=this.get('walletAssets')
    var dappData=this.get('dappData')
    var index //记录需要删除的下标
    //查询对应的下标
    for(var i=0;i<walletUuid.length;i++){
      if(identity===walletUuid[i]){
        index=i
      }
    }
    /*删除对应的数据并保存删除后的数组*/
    walletUuid=walletUuid.splice(index,1)
    this.setObject('walletUuid',walletUuid)

    /*删除对应的钱包数据*/
    delete walletSql[identity]
    delete walletAssets[identity]
    delete dappData[identity]

    //保存删除后的钱包对象
    this.set('walletSql',walletSql)
    this.set('walletAssets',walletAssets)
    this.set('dappData',dappData)

    console.log(walletSql)
    console.log(walletAssets)
  }

  /*生成uuid*/
  guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  // 显示loading
  show() {
    this.loading = this.loadingCtrl.create({
      content: '努力加载中...'
    });
    this.loading.present();
  }
  
  // 隐藏loading
  hide() {
    if (this.loading) {
      this.loading.dismiss();
    }
  }

  
  //提示弹窗
  presentToast(value) {
    const toast = this.toastCtrl.create({
      message: value,
      duration: 2000
    });
    toast.present();
  }


  //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
  tabHide(){
    let elements = document.querySelectorAll(".tabbar");
      if(elements != null) {
          Object.keys(elements).map((key) => {
              elements[key].style.display ='none';
          });
      }
  }

  //防止使用tabHide方法后底部tab隐藏
  tabShow(){
    let elements = document.querySelectorAll(".tabbar");
      if(elements != null) {
          Object.keys(elements).map((key) => {
              elements[key].style.display ='flex';
          });
      }
  }

  //复制文本实现方法
  copy=function(str){
    var save = function (e){
      e.clipboardData.setData('text/plain',str);//clipboardData对象
      e.preventDefault();//阻止默认行为
    };
    const toast = this.toastCtrl.create({
      message: '复制成功',
      duration: 1000
    });
    toast.present();
    document.addEventListener('copy',save);
    document.execCommand("copy");//使文档处于可编辑状态，否则无效
  }

  /*
    将需要加密或解密的字符串传入
    code为接收变量
  */
  //对字符串进行加密   
  compileStr(code){
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);  
    for(var i=1;i<code.length;i++){        
        c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));  
    }     
    return escape(c);
  }
  //字符串进行解密   
  uncompileStr(code){
    code = unescape(code);        
    var c=String.fromCharCode(code.charCodeAt(0)-code.length);        
    for(var i=1;i<code.length;i++){        
        c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));        
    }        
    return c;
  } 
}