import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../../tabs/tabs';
import { NativeService } from '../../../servies/Native.service';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';


@IonicPage()
@Component({
  selector: 'page-firstuse',
  templateUrl: 'firstuse.html',
})
export class FirstusePage {
  walletDate:any=[]; //钱包数据大数组
  loginPsw:String; //登录密码
  isCheck =true //设置密码输入可见时图标
  isDisplay=false //设置密码输入不可见时图标
  visibility:string="password"; //设置密码输入框类型,作用为密码是否可见
  assetsDate:any=[]; //钱包资产数据大数组
  walletAssets:any=[] //当前钱包资产数据列表
  bdcApplist:any=[] //八斗类型应用列表数组
  RMBURL:any="https://ali-waihui.showapi.com/waihui-transform?fromCode=USD&money=1&toCode=CNY" //请求人民币汇率URL
  RMBlist:any; //人民币汇率请求返回数据列表
  RMBexchangeRate:any; //人民币汇率
  currentApp:any=[]; //当前钱包应用数据列表

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public navService:NativeService,
    private http: Http,) {
  }

    ionViewDidEnter(){
      //记录首次使用App
      this.navService.set('firstTo',true);
      //首次使用记录,用以数据渲染标记
      this.navService.set('firstRender',true);


      /*新的数据逻辑(参照数关系型数据库)*/
      //创建一个存储钱包唯一标识uuid的数组对象
      this.navService.setObject('walletUuid',[])
      //创建一个存储钱包基础信息的对象
      this.navService.set('walletSql',{})
      //创建一个存储钱包资产信息的对象
      this.navService.set('walletAssets',{})
      //创建一个存储BDC资产&应用的对象
      this.navService.set('dappData',{})

      //标识修改数据格式
      this.navService.set('ChangeData',false)

      //设置请求头
      let headers = new Headers({'authorization': 'APPCODE f17cb9b0ee7543c982a4a8993218726a'});
      //请求人民币汇率
      this.http.request(this.RMBURL,new RequestOptions({headers: headers}))
      .subscribe((res: Response) => {
        this.RMBlist = res.json(); //将得到的数据转化为json
        this.RMBexchangeRate=this.RMBlist.showapi_res_body.money; //赋予美元汇率
        //将汇率存储在本地
        this.navService.set('RMBexchangeRate',this.RMBexchangeRate);
      })
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FirstusePage');
  }

  //首次使用App,跳转到创建钱包或导入钱包页面
  goTabs(){
    /*将登录密码加密*/
    var lockLoginPsw=this.navService.compileStr(this.loginPsw)

    //创建登录密码
    this.navService.set('loginPsw',lockLoginPsw)

    this.navService.set('limit',false) /*执行限制标识,用于密码加密*/
    console.log(this.navService.get('loginPsw'))
  	this.navCtrl.push('InitpagePage');
    
  }

  //设置密码可见
  showicon(){
    this.isCheck=false;
    this.isDisplay=true;
    this.visibility="text";
  }

  //设置密码不可见
  hideicon(){
    this.isCheck=true;
    this.isDisplay=false;
    this.visibility="password";
  }




}
