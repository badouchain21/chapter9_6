import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {NativeService} from '../../../servies/Native.service'


@IonicPage()
@Component({
    selector: 'page-select-type',
    templateUrl: 'select-type.html',
})
export class SelectTypePage {

    importTitle: string = "导入私钥"; //导入私钥标题
    acount: boolean; //是否为导入账户
    currencyList: any = []; //货币数据列表
    walletIndex: any = null;//钱包索引
    isSetPsw: boolean = false;// 是否显示设置支付密码页面
    isInsertPsw: boolean = false; // 是否在输入密码页面
    walletPsw: string = null
    walletArr: any = null;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NativeService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SelectTypePage');
    }

    ionViewWillEnter() {
        //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
        this.navService.tabHide()

        this.acount = this.navParams.get('isaccount')
        console.log(this.acount)

        this.currencyList = [{name: "BDC私钥", jumpFunction: "goBDC()", logo: "./assets/imgs/bdlogo.png"},
            {name: "ETH私钥", jumpFunction: "goETH()", logo: "./assets/imgs/eth.png"},
            {name: "BTC私钥", jumpFunction: "goBTC()", logo: "./assets/imgs/btc.png"}]
    }

    //跳转导入页面
    jumpPage(currencyType) {
        switch (currencyType) {
            case "BDC私钥":
                currencyType = "BDC"
                this.goImport(currencyType)
                break;
            case "ETH私钥":
                currencyType = "ETH"
                this.goImport(currencyType)
                break;
            case "BTC私钥":
                currencyType = "BTC"
                this.goImport(currencyType)
                break;

            default:
                // code...
                break;
        }
    }


    goImport(type) {
        var set = this.checkIsNeedSetWalletPsw()
        if (set) {
            return;
        }
        if (this.acount) {
            this.navCtrl.push('ImaccountPage', {
                type: type,
            })

        } else {
            this.navCtrl.push('ImwalletPage', {
                type: type,
            })
        }
    }

    // 检查是否需要设置钱包密码
    checkIsNeedSetWalletPsw() {
        this.walletIndex = this.navService.get('walletIndex')
        if (this.walletIndex == null || this.walletIndex < 0) {
            this.walletIndex = 0;
        }
        this.walletArr = this.navService.getObject("walletObject")
        if (this.walletArr == null || this.walletArr.length == 0) {
            return false;
        }
        var wallet = this.walletArr[this.walletIndex];
        if (wallet.walletPsw == null) {
            this.isSetPsw = true
            return true;
        }
        return false;
    }

    // 打开设置支付密码框
    setPsw() {
        // 如果不是设置支付密码 则转换成设置支付密码页面
        if (!this.isInsertPsw) {
            this.isInsertPsw = true
        } else {
            var verification = /^\d+$/;
            if (this.walletPsw.length != 6) {
                this.navService.presentToast("密码长度必须为六位")
                return
            }
            if (!verification.test(this.walletPsw)) {
                this.navService.presentToast("密码长度必须为纯数字")
                return
            }
            this.isInsertPsw = false
            this.isSetPsw = false
            var lockPsw = this.navService.compileStr(this.walletPsw)
            this.walletArr[this.walletIndex].walletPsw = lockPsw
            this.navService.setObject("walletObject", this.walletArr)
            this.navService.presentToast("设置成功")
        }
    }
    // 取消
    cancel(){
        this.isSetPsw = false;
        this.isInsertPsw = false;
    }

}
