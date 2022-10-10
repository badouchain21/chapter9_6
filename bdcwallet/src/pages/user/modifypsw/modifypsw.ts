import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {NativeService} from '../../../servies/Native.service';

@IonicPage()
@Component({
    selector: 'page-modifypsw',
    templateUrl: 'modifypsw.html',
})
export class ModifypswPage {
    title: string = "修改密码"; //标题
    currentPsw: string; //当前密码
    newPsw: string; //新密码
    rePsw: string; //重复密码
    walletIndex: any;
    modifyType: number = 0;// 修改类型 0修改钱包密码 1 修改app登录密码

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NativeService,) {
    }

    //修改密码事件
    modify() {
        this.walletIndex = this.navService.get("walletIndex")
        if (this.newPsw != this.rePsw) {
            var str = "两次输入的密码不一致"
            this.navService.presentToast(str)
        } else {
            // 如果修改密码类型为修改钱包
            if (this.modifyType == 0) {
                var verification = /^\d+$/;
                if ((!verification.test(this.newPsw)) || this.newPsw.length != 6) {
                    this.navService.presentToast("只能输入6位纯数字密码")
                    return
                }
                this.walletIndex = this.navParams.get('walletindex')
                var walletObject = this.navService.get("walletSql")
                /*解密钱包密码*/
                var unlockPsw = this.navService.uncompileStr(walletObject[this.walletIndex].walletPsw)
                if (this.currentPsw === unlockPsw && this.newPsw === this.rePsw) {
                    /*加密钱包密码*/
                    var lockPsw = this.navService.compileStr(this.newPsw)
                    walletObject[this.walletIndex].walletPsw = lockPsw
                    this.navService.set('walletSql', walletObject)
                    this.navService.presentToast("修改成功")
                    this.navCtrl.pop();
                } else {
                    this.navService.presentToast("密码错误,请重新输入")
                }
            } else {
                /*解密app登录密码*/
                var unLockLoginPws = this.navService.uncompileStr(this.navService.get('loginPsw'))

                if (this.currentPsw === unLockLoginPws && this.newPsw === this.rePsw) {
                    /*加密钱包密码*/
                    var lockLoginPws = this.navService.compileStr(this.newPsw)
                    this.navService.set('loginPsw', lockLoginPws)
                    this.navService.presentToast("修改成功")
                    this.navCtrl.pop();
                } else {
                    this.navService.presentToast("密码错误,请重新输入")
                }
            }

        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ModifypswPage');
    }

    ionViewWillEnter() {
        this.modifyType = this.navParams.get('modifyType') == null ? 0 : this.navParams.get('modifyType');
        if (this.modifyType == 1) {
            this.title = "修改登录密码"
        }
        //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
        this.navService.tabHide()
    }

}
