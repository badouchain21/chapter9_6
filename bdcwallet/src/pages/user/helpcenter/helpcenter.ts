import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response, } from '@angular/http';
import {HttpService} from '../../../servies/Http.service';
import {APP_SERVER_BDC} from '../../../servies/common.HttpUrl';


@IonicPage()
@Component({
  selector: 'page-helpcenter',
  templateUrl: 'helpcenter.html',
})
export class HelpcenterPage {

	title:string="帮助中心"
  isModify:boolean=false; //修改弹框显示控制
  token_data:string=null; //token数据
  questionList:any=[]; //问题数据集合
  showTitle:string=null; //问题标题
  showContent:string=null; //问题内容

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http:Http,
    private navHttpfun: HttpService,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpcenterPage');
  }

  itemSelected(item: string) {
    console.log("Selected Item", item);
  }

  ionViewWillEnter(){
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
  }

  ionViewDidEnter(){
    this.getQuestion()
  }

  ionViewWillLeave(){
    this.questionList=[]
  }

  //获取问题合集
  getQuestion(){
    /*获取问题合集URL*/
    var getUrl=APP_SERVER_BDC+"/wallet/question/commonquestionlist/listJSON.do?mdCode=walletQuestion&"

    var searchParam=[{'name':'IS_SHOW','type':'exact-match','value':'1'}]

    getUrl+=this.navHttpfun.toBodyString({
            searchParam: JSON.stringify(searchParam)
        })

    this.http.get(getUrl).subscribe((res)=>{
      var returnData=res.json()
      console.log(returnData)
      this.questionList=returnData.Rows
    },(error)=>{

    })
  }

   //修改弹窗隐藏
  hideModify(){
    this.isModify=false;
  }

  //修改弹窗显示
  /*
    data 问题数据
  */
  showModify(data){
    this.isModify=true;
    this.showTitle=data.title
    this.showContent=data.content
  }

  //跳转提交问题页面
  goAsk(){
    this.navCtrl.push('FeedbackPage');
  }

}
