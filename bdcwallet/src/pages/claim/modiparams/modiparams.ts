import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { Http, Response, } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { NativeService } from '../../../servies/Native.service';
import { HttpService } from '../../../servies/Http.service';
import { APP_SERVER_BDC } from '../../../servies/common.HttpUrl';

@IonicPage()
@Component({
  selector: 'page-modiparams',
  templateUrl: 'modiparams.html',
})
export class ModiparamsPage {
	title:string; //标题
	token:string; //token地址
	appId:string; //appId
	id:string; //接口id
	type:string; //类型
	paramList:any=[]; //请求参数列表
  requestURL:string; //请求url
  isExist:boolean; //参数是否显示
  returnData:any; //请求获取的数据
  DataName:any=null; //参数键数组
  passId:string; //调试传递id
  address:string; //钱包地址
  exampleList:any; //示例列表
  loading:any; //loading效果
  isGet:boolean; //控制是否需要填写接口id输入框
  walletIndex:any; //当前钱包索引
  walletObject:any; //本地钱包数据
  findList:any=[]; //示例参数键名数组
  passList:any=[]; //调试传递参数
  renderData:any=[] //显示在页面的return_data数组
  renderName:any; //显示在页面的return_data数组键名

  constructor(
    public navCtrl: NavController, 
  	public navParams: NavParams,
  	private http:Http,
    public loadingCtrl: LoadingController,
    public navService:NativeService,
    public toastCtrl: ToastController,
    public navHttpfun:HttpService,) {
  }

  ionViewDidLoad() {
   
  }

  ionViewWillLeave(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
    this.navService.hide()
  }

  ionViewDidEnter(){
    /*获取页面传递参数*/
  	this.token=this.navParams.get('token')
  	this.appId=this.navParams.get('appId')
  	this.id=this.navParams.get('id')
    this.title=this.navParams.get('title')

    this.walletObject=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')
    this.address=this.walletObject[this.walletIndex].BDCaddress
    this.requestURL=null

    this.navService.hide()
    /*正式环境 or 测试环境*/
    var getURL=APP_SERVER_BDC+"/restapi/wallet/interface/"+this.id+"/params"
    var paramURL=APP_SERVER_BDC+"/intermanage/interfacedetail/interfacedetaillist/genRandData.do?interfaceId="+this.id
    
    this.http.post(paramURL,null).subscribe((res:Response)=>{
      this.navService.hide()
      this.exampleList=res.json()
      console.log(this.exampleList)
      this.findList=Object.keys(this.exampleList)
      
      this.http.request(getURL).subscribe((res:Response)=>{
        this.paramList=res.json()
        console.log(this.paramList)
        this.type=this.paramList.return_data.requestType
        switch (this.type) { //控制参数列表是否显示在页面
          case "GET_BY_ID":
            this.isExist=false;
            this.isGet=true;
            break;
          case "GET":
            this.isExist=false;
            this.isGet=false;
            break;
          case "POST":
            this.isExist=true;
            this.isGet=false;
            break;
          case "PUT":
            this.isExist=true;
            this.isGet=false;
            break;
          default:
            // code...
            break;
        }
        this.requestURL=this.paramList.return_data.requestUrl
        this.paramList=this.paramList.return_data.params

        for(var i=0;i<this.paramList.length;i++){ //获取键
          this.paramList[i].value=null;
          for(var j=0;j<this.findList.length;j++){
            if(this.paramList[i].fieldName===this.findList[j]){
              var str=this.findList[j]
              this.paramList[i].example=this.exampleList[str]
            }

          }
          if(!this.paramList[i].fieldDescription){
            
            this.paramList[i].fieldDescription=this.paramList[i].fieldName
          }
        }

      },(error:Response)=>{
        this.navService.hide()
        var str="网络出错"
        this.navService.presentToast(str)
      })

    },(error:Response)=>{
      this.navService.hide()
      var str="网络出错"
      this.navService.presentToast(str)
    })

  }

  //确定按钮点击事件
  modifyEnter(){
    /*初始化数据列表*/
    this.returnData=[]
    this.renderData=[]
    this.renderName=[]
    this.DataName=[]
    this.passList = {}

    this.paramList.forEach((i) => {
      this.passList[i.fieldName]=i.value
    })
    for(var j=0;j<this.paramList.length;j++){
      if(this.passList[this.paramList[j].fieldName]===null){
        this.passList[this.paramList[j].fieldName]=this.paramList[j].example
      }
    }
    //设置请求头,使参数以表单形式传递
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
    this.navService.show()
    switch (this.type) {
      case "GET_BY_ID":
        /*正式环境 or 测试环境*/
        var launchURL=APP_SERVER_BDC+this.requestURL+"/"+this.passId+"?token="+this.token;
        
        this.http.request(launchURL).subscribe((res:Response)=>{
          this.returnData=res.json()

          this.DataName=Object.keys(this.returnData)
          this.navService.hide()
        },(error:Response)=>{
          this.navService.hide()
          var str="网络出错"
          this.navService.presentToast(str)
        })
        break;
      case "GET":
        /*正式环境 or 测试环境*/
        var launchURL=APP_SERVER_BDC+this.requestURL+"?token="+this.token;
        
        this.http.request(launchURL).subscribe((res:Response)=>{
          this.returnData=res.json()
          
          this.DataName=Object.keys(this.returnData)
          this.navService.hide()
        },(error:Response)=>{
          this.navService.hide()
          var str="网络出错"
          this.navService.presentToast(str)
        })
        break;
      case "POST":
        /* 正式环境 or 测试环境 */
        var launchURL=APP_SERVER_BDC+this.requestURL+"?address="+this.address+"&token="+this.token;
        
        this.passList.$class=this.exampleList.$class

        var params={
          jsonStr:JSON.stringify(this.passList)
        }
        
        this.http.post(launchURL,this.navHttpfun.toBodyString(params),new RequestOptions({headers: headers})).subscribe((res:Response)=>{
          this.returnData=res.json()
          console.log(this.returnData)

          if(this.returnData.return_data!=null){
            this.renderData=this.returnData.return_data
            this.renderName=Object.keys(this.renderData)
          }
          
          this.returnData.return_data=null
          this.DataName=Object.keys(this.returnData)
          this.navService.hide()
        },(error:Response)=>{
          this.navService.hide()
          var str="网络出错"
          this.navService.presentToast(str)
        })
        break;
      case "PUT":
        /* 正式环境 or 测试环境 */
        var launchURL=APP_SERVER_BDC+this.requestURL+"?address="+this.address+"&token="+this.token;
        
        this.passList.$class=this.exampleList.$class
        var params={
          jsonStr:JSON.stringify(this.passList)
        }
        this.http.post(launchURL,this.navHttpfun.toBodyString(params),new RequestOptions({headers:headers})).subscribe((res:Response)=>{
          this.returnData=res.json()
          if(this.returnData.return_data!=null){
            this.renderData=this.returnData.return_data
            this.renderName=Object.keys(this.renderData)
          }
          
          this.returnData.return_data=null
          this.DataName=Object.keys(this.returnData)
          this.navService.hide()
        },(error:Response)=>{
          this.navService.hide()
          var str="网络出错"
          this.navService.presentToast(str)
        })
        break;
      default:
        // code...
        break;
    }
  }

}
