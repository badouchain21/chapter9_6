import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';

@IonicPage()
@Component({
  selector: 'page-email',
  templateUrl: 'email.html',
})
export class EmailPage {
	mailStr:string=null; //邮箱地址
	defualtStr:string="请输入邮箱..."

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public navService:NativeService,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EmailPage');
  }

  ionViewWillEnter(){
  	var str=this.navService.get('mailStr')
  	if(str!=null){
  		this.defualtStr=this.navService.get('mailStr')
  	}
    
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
  }

  //点击绑定事件
  Binding(){	
  	if(this.mailStr!=null){
  		/*检测邮箱格式*/
  		var reg=/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
      var succressStr="修改成功"
	    if(!reg.test(this.mailStr))
	    {
	        var str="请检查邮箱是否填写正确"
          this.navService.presentToast(str)
	        return false;
	    }
  		this.navService.set('mailStr',this.mailStr)
      this.navService.presentToast(succressStr)
      this.navCtrl.pop()
  	}else{
  		var str="请检查邮箱是否填写"
      this.navService.presentToast(str)
  	}
  }

}
