import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import {HttpService} from '../../../servies/Http.service';
import {APP_SERVER_BDC, APP_SERVER_ETH, APP_SERVER_ETH_NODE, UNION_URL,mime} from '../../../servies/common.HttpUrl';
import {NativeService} from '../../../servies/Native.service';

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {
  title:String="提交问题"; //标题
  token_data:String=null; //token数据
  issueStr:any=""; //问题描述
  wordCount:any=150; //问题描述字数
  remaining:any=0; //问题描述剩余字数
  spanStyle:any={}; //字数计算标签样式控制
  walletIndex:any=null;
  btnStyle:any={'style':{},'disable':true}; //提交按钮样式控制
  // 当前所选文件数目是否达到规定
  // isCFileRun:boolean=false;
  // // 允许上传图片张数
  // allowUploadNum:number=1;
  // startSellTime:"";
  // // 设置选择图片状态
  // hasChooseImage:boolean=false;
  // list:any=[];
  // anoList:any=[];
  email:any=null; //用户名
  issueTitle:string=null; //问题标题

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private http:Http,
  	private navHttpfun: HttpService,
  	public navService: NativeService,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
  }

  ionViewWillEnter(){
  	this.walletIndex=this.navService.get('walletIndex')
  	var walletObj=this.navService.get('walletSql')
  	console.log(walletObj)
  	this.email=walletObj[this.walletIndex].email
  	if(this.email===undefined){
  		this.email=this.navService.get('mailStr')
  	}
  	console.log(this.email)
  }

  //问题描述长度控制
  getLength(){
    if(this.issueStr.length<=150){
      this.remaining=this.issueStr.length
    }
    if(this.issueStr.length>0){
      this.btnStyle.style={
        'background-color':'#35B8C7'
      }
      this.btnStyle.disable=false;
    }else{
      this.btnStyle.style={
        'background-color':'#D9D9D9'
      }
      this.btnStyle.disable=true
    }
    if(this.remaining===150){
      this.spanStyle={
        'color':'red'
      }
    }else{
      this.spanStyle={}
    }

  }


   //点击选择图片
  // selectImg(){
  //   document.getElementById("files").click();
  // }

  // fileOnchang = (event) => {
  //   console.log('------fileChanged---------')
  //   // 本次选择图片文件
  //   var choosefile=event.target.files;
  //   // 对本次选择文件进行转化
  //   var useFile=[];
  //   Array.prototype.push.apply(useFile, choosefile);
  //   // 筛选后文件
  //   var file=[];
  //   for(var i=0;i<useFile.length;i++){
  //      var fileType=useFile[i].type;
  //      var fileName=useFile[i].name;
  //      if(!fileType){
  //        fileType=mime[useFile[i].name.match(/\.([^\.]+)$/i)[1]];
  //      }
  //      if (!(/image.(png|jpeg|jpg)/.test(fileType))) {
  //        this.navService.presentToast("当前文件格式不支持");
  //        // 执行这句的时候会影响循环体中i,所以需要动态修改
  //        i--;
  //        useFile=useFile.filter(function(file) {
  //           return file.name !== fileName;
  //        });
  //      } 
  //   }
  //   file=useFile; 
  //   // 后续使用文件
  //   var files=[];
  //   if(file && file.length){
  //     if(!this.list.length){
  //       this.list=file;
  //       // Array.prototype.push.apply(this.list, file);
  //       if(this.list.length>this.allowUploadNum){
  //         this.list.splice(this.allowUploadNum,this.list.length);
  //         this.navService.presentToast("只能提交一个附件")
  //       }
  //       files= this.list;
  //       console.log("第一波新出炉的列表数据操作："+JSON.stringify(this.list))
  //     }
  //     else{
  //       // Array.prototype.push.apply(this.anoList, file);
  //       this.anoList=file;
  //       this.list=this.list.concat(this.anoList);
  //       if(this.list.length>this.allowUploadNum){
  //         files= this.anoList.splice(0,this.list.length-this.allowUploadNum);
  //         this.list.splice(this.allowUploadNum,this.list.length);
  //         this.navService.presentToast("只能提交一个附件")
  //         this.anoList=[];
  //       }
  //       else{
  //         this.isCFileRun=false;
  //         files= this.anoList;
  //         this.anoList=[];
  //       }
        
  //       console.log("第二波新出炉的列表数据操作："+JSON.stringify(this.list));
  //     }
  //   }
  // if(!this.isCFileRun){
  //   var _thiss=this;
  //   // 假设 "preview" 是将要展示图片的 div
  //   var preview = document.getElementById("imgArea");
  //   for (var i = 0; i < files.length; i++) {//预览新添加的图片
  //       var fileOnce = files[i];
  //       var fileName=fileOnce.name;
  //       // 创建每个图片模块div元素
  //       var div = document.createElement("div");
  //       div.setAttribute("class","sectionImgArea");
  //       // 将模块添加进整体div
  //       preview.appendChild(div);
  //       $('#add').before(div)

  //       // 创建关闭图标标签元素
  //       var ionIcon = document.createElement("ion-icon");
  //       ionIcon.setAttribute("class","close icon icon-ios ion-md-close-circle");
  //       ionIcon.setAttribute("name","md-close-circle");
  //       // 为该元素添加点击事件
  //       ionIcon.onclick=(event)=>{
  //            console.log(JSON.stringify(event))
  //            // 实质删除元素
  //            $(event.target).parent().remove();
  //            var deleteName=$(event.target).next().attr("name");
  //            // this.list=
  //            console.log($(event.target).next().attr("name"));
  //            this.list=this.list.filter(function(file) {
  //                return file.name !== deleteName;

  //            });
  //            // 删除所选图片的时候，动态修改是否可添加图片状态
  //            if(this.list.length<this.allowUploadNum){
  //                this.isCFileRun=false;
  //            }
  //       }
  //       // 把图标添加进图片模块div
  //       div.appendChild(ionIcon);
        
        

  //       // 创建主图片标签
  //       var img = document.createElement("img");
  //       img.classList.add("obj");
  //       img.setAttribute('file',fileOnce);
  //       img.setAttribute("name",fileName);
  //       // 把主图片添加进图片模块div
  //       div.appendChild(img);


  //       var reader = new FileReader();
  //       reader.onload = (function(aImg) {
  //         return function(e) {
  //           aImg.src = e.target.result;
  //         };
  //       })(img);
  //       reader.readAsDataURL(fileOnce);
  //   }
  //   // 页面图片预览加载成功后，设置已选图片
  //   this.hasChooseImage=true;
  //   if(this.list.length==this.allowUploadNum){
  //      this.isCFileRun=true;
  //   }
  //  }
  //  // $("#filed").val("");
  //  if($('.sectionImgArea')){
  //     this.btnStyle.disable=false
  //     this.btnStyle.style={
  //       'background-color':'#35D0BA'
  //     }
  //  }
  // }

  //提交问题
  submitQuestion(){
    this.navService.show()
    if(this.issueStr.length<10){
    this.navService.hide()
      var str="问题描述至少十个字"
      this.navService.presentToast(str)
    }else{
      /*提交问题URL*/
      var submitUrl=APP_SERVER_BDC+"/restapi/wallet/submitQuestion"

      var param={
      	content:this.issueStr,
      	title:this.issueTitle,
      	email:this.email
      }


      //设置请求头,使参数以表单形式传递
      let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
      // new RequestOptions({headers: headers})


      this.http.post(submitUrl,this.navHttpfun.toBodyString(param),new RequestOptions({headers: headers})).subscribe((res)=>{
      	var returnData=res.json()
      	console.log(returnData)
      	this.navService.hide()
      	if(returnData.return_code==="SUCCESS"){
      		var str="提交成功"
      		this.navService.presentToast(str)
      		this.pageClear()
      	}
      },(error)=>{
      	this.navService.hide()
      	var str="网络出错,稍后重试"
      	this.navService.presentToast(str)
      })
  	}
  }

  //清空页面
  pageClear(){
    this.issueStr=""
    this.issueTitle=''
    // $('.sectionImgArea').remove()
    // this.list=[]
    // this.anoList=[];
    // this.hasChooseImage=false
    // this.isCFileRun=false
  }

}
