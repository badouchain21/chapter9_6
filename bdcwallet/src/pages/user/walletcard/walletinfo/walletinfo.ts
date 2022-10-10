import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    AlertController,
    ToastController,
    ActionSheetController
} from 'ionic-angular';
import {NativeService} from '../../../../servies/Native.service';
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {HttpService} from '../../../../servies/Http.service';
import {APP_SERVER_BDC} from '../..//../../servies/common.HttpUrl';


@IonicPage()
@Component({
    selector: 'page-walletinfo',
    templateUrl: 'walletinfo.html',
})
export class WalletinfoPage {
    title: string = "设计" //标题
    privatekey: string; //私钥
    walletindex: any; //钱包索引
    walletInfo: any; //获取钱包数据
    isDelete: boolean; //删除钱包确认框是否显示
    deleteTitle: string = "删除钱包"  //删除钱包标题
    sutitle: string = "请慎重,此操作不可撤销" //删除钱包副标题
    enter: string = "确认" //确认按钮
    cancel: string = "取消" //取消按钮
    password: string; //确认密码
    isFooter: boolean = true //控制footer是否存在
    verification: string; //验证密码框中的值
    isCopy: boolean = false; //是否弹出密码验证框
    selected: string; //选择的私钥类型
    currentAssets: any; //当前钱包资产数据列表
    currentApp: any; //当前钱包账户数据列表
    assetsList: any; //资产&应用&账户数据列表
    bdcApplist: any; //当前钱包应用数据列表
    placeholder: string = "请输入密码...";
    isBdcLogin: boolean = false;
    deleteBottunText: string = "删除钱包"
    walletNum:any; //钱包总个数

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private navHttpfun: HttpService,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public navService: NativeService,
        private http: Http,
        public actionSheetCtrl: ActionSheetController,) {

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad WalletinfoPage');
    }

    ionViewWillEnter() {
        //获取当前钱包索引
        this.walletindex = this.navParams.get('index')
        console.log(this.walletindex)
        //获取钱包数据
        this.walletInfo = this.navService.get('walletSql')
        this.walletNum=this.walletInfo.length
        console.log(this.walletInfo)
        this.title = this.walletInfo[this.walletindex].walletName;
        // 获取是否是BDC帐号登录的标志
        this.isBdcLogin = this.walletInfo[this.walletindex].isBdcLogin == null ? false : this.walletInfo[this.walletindex].isBdcLogin;
        if (this.isBdcLogin) {
            this.deleteBottunText = "注销钱包"
        }
        this.isFooter = true;
    }

    //页面离开时隐藏底部按钮
    ionViewWillLeave() {
        this.isFooter = false;
        if (this.walletInfo.length === 0) {
            var str = "当前无钱包数据"
            this.navService.presentToast(str)
            this.navCtrl.push('CrewalletPage')
        }
    }

    //弹窗复制私钥
    showConfirm() {
        const confirm = this.alertCtrl.create({
            title: '导出私钥', //标题
            subTitle: '安全警告', //副标题
            message: this.privatekey, //内容
            buttons: [
                {
                    text: '复制私钥',
                    handler: () => {
                        this.isCopy = false
                        this.copy(this.privatekey)
                    }
                }
            ]
        });
        confirm.present();
    }

    //弹窗输入密码
    Passwordvalidation() {
        var getUrl = APP_SERVER_BDC + "/restapi/wallet/exportPrivateKey"
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        // 如果是bdc类型且有邮箱的，则通过输入的密码去访问云中心导出私玥
        if (this.selected == "ordinary" && this.walletInfo[this.walletindex].email != null) {
            var params = {address: this.walletInfo[this.walletindex].BDCaddress, authCode: this.verification}
            this.http.post(getUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
                var returnData = res.json()
                this.placeholder = "请输入密码..."
                if (returnData.return_code === "SUCCESS") {
                    this.privatekey = returnData.return_data;
                    this.isCopy = false;
                    this.showConfirm()
                } else {
                    var str = "授权码不正确";
                    this.isCopy = false;
                    this.navService.presentToast(str)
                }
            }, (error: Response) => {
                var str = "网络出错"
                this.isCopy = false
                this.placeholder = "请输入密码..."
                this.navService.presentToast(str)
            })

        } else {
            var unlockPsw = this.navService.uncompileStr(this.walletInfo[this.walletindex].walletPsw);
            if (unlockPsw === this.verification) {
                this.showConfirm()
                this.isCopy=false
            } else {
                var str = "密码不正确"
                this.isCopy = false;
                this.navService.presentToast(str)
            }

        }
    }

    //弹窗删除钱包
    showDelete() {
        // 如果是八斗帐号登录 则直接注销
        if (this.isBdcLogin) {
            this.enterDelete();
        } else {
            this.isDelete = true;

        }
    }

    //隐藏删除钱包弹框
    hideBlock() {
        this.isDelete = false;
        this.isCopy = false;
        this.verification = null
        this.password = null
    }

    //删除钱包
    enterDelete() {
        console.log("index:" + this.walletindex)
        /*解密钱包密码*/
        var unlockPsw = this.navService.uncompileStr(this.walletInfo[this.walletindex].walletPsw)

        if (this.password === unlockPsw || this.isBdcLogin) {
            // this.walletInfo.splice(this.walletindex, 1);
            // this.navService.setObject('walletObject', this.walletInfo)
            // this.currentAssets = this.navService.getObject('currentAssets')
            // this.currentApp = this.navService.getObject('currentApp')
            // this.assetsList = this.navService.getObject('assetsList')
            // this.bdcApplist = this.navService.getObject('bdcApplist')

            // /*将当前删除的钱包本地数据同时删除*/
            // this.deleteWallet(this.currentAssets)
            // this.deleteWallet(this.currentApp)
            // this.deleteWallet(this.assetsList)
            // this.deleteWallet(this.bdcApplist)

            // /*存储删除后的数据列表*/
            // this.navService.setObject('currentAssets', this.currentAssets)
            // this.navService.setObject('currentApp', this.currentApp)
            // this.navService.setObject('assetsList', this.assetsList)
            // this.navService.setObject('bdcApplist', this.bdcApplist)
            // this.navService.set('walletIndex', 0);
            // console.log("walletInfo")
            // console.log(this.walletInfo)
            // console.log("currentAssets")
            // console.log(this.currentAssets)
            // console.log("currentApp")
            // console.log(this.currentApp)
            // console.log("assetsList")
            // console.log(this.assetsList)
            // console.log("bdcApplist")
            // console.log(this.bdcApplist)
            this.navService.deleteWallet(this.walletindex)
            this.navCtrl.pop()
        } else {
            var str = "密码不正确"
            this.navService.presentToast(str)
        }
        this.isDelete = false;

    }

    //删除所属钱包本地数据
    deleteWallet(walletListInfo) {
        for (var i = 0; i < walletListInfo.length; i++) { /*循环删除所属选择钱包的数据*/
            if (walletListInfo[i].belong === this.walletindex) {
                walletListInfo.splice(i, 1)
                /*每次使用splice方法会重新组装一个新的数据*/
                i = i - 1;
            }
        }
        if ((parseInt(this.walletindex) + 1) !=this.walletNum)
            for (var j = 0; j < walletListInfo.length; j++) { /*更新删除后的数据*/
                if (walletListInfo[j].belong != 0 && walletListInfo[j].belong >= this.walletindex) {
                    walletListInfo[j].belong = walletListInfo[j].belong - 1
                }
            }
    }

    //打开复制弹窗
    enterCopy() {
        /*/!*解密钱包密码*!/
      var unlockPsw=this.navService.uncompileStr(this.walletInfo[this.walletindex].walletPsw);

      if(unlockPsw===this.verification){*/
        this.isCopy = false;
        this.verification = null
        this.selectType()
        /* }else{
           var str="密码不正确"
           this.navService.presentToast(str)
         }*/

    }

    //复制文本实现方法
    copy = this.navService.copy
    temp: boolean = false;

    // 组装导出私玥按钮
    getButtons() {
        var buttons = []
        buttons.push({
            text: '取消',
            role: 'cancel',
            handler: () => {
                this.temp = false;
            }
        })
        if (this.walletInfo[this.walletindex].ETHprivKey) {
            buttons.push({
                text: 'ETH私钥',
                handler: () => {
                    if (this.temp) {
                        this.selected = "bdwallet";
                        this.privatekey = this.walletInfo[this.walletindex].ETHprivKey.substring(2)
                        this.placeholder = "请输入密码...";
                        this.temp = false;
                        this.isCopy = true;

                    }
                }
            })
        }
        if (this.walletInfo[this.walletindex].BTCprivKey) {
            buttons.push({
                text: 'BTC私钥',
                handler: () => {
                    if (this.temp) {
                        this.selected = "bit"
                        this.privatekey = this.walletInfo[this.walletindex].BTCprivKey
                        this.placeholder = "请输入密码...";
                        this.temp = false;
                        this.isCopy = true;
                    }
                }
            })
        }
        if (this.walletInfo[this.walletindex].BDCaddress) {
            buttons.push({
                text: 'BDC私钥',
                handler: () => {
                    if (this.temp) {
                        this.selected = "ordinary";
                        this.privatekey = this.walletInfo[this.walletindex].BDCprivKey
                        if (this.walletInfo[this.walletindex].email == null) {
                            this.placeholder = "请输入密码...";
                        } else {
                            this.placeholder = "请输入八斗账户授权码...";
                        }
                        this.temp = false;
                        this.isCopy = true;
                    }
                }
            })
        }
        return buttons;

    }

    //选择类型点击事件
    selectType() {
        this.temp = true;
        var bottuns = []
        bottuns = this.getButtons();
        const actionSheet = this.actionSheetCtrl.create({
            title: '选择货币类型',
            buttons: bottuns
        });
        actionSheet.present();
    }

    //跳转到修改密码页面
    goModifypsw() {
        this.navCtrl.push('ModifypswPage', {walletindex: this.walletindex})
    }
}
