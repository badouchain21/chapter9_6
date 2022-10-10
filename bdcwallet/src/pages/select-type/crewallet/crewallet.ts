import {Component} from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ActionSheetController,
    AlertController,
    LoadingController,
    ToastController
} from 'ionic-angular';
import EthereumJsWallet from 'ethereumjs-wallet';
import {NativeService} from '../../../servies/Native.service';
import {TabsPage} from '../../tabs/tabs';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {HttpService} from '../../../servies/Http.service';
import {APP_SERVER_BDC} from '../../../servies/common.HttpUrl';

@IonicPage()
@Component({
    selector: 'page-crewallet',
    templateUrl: 'crewallet.html',
})
export class CrewalletPage {
    walletObject: any = []; //存放钱包数据数组
    walletName: string = null; //钱包名称
    walletPsw: string; //钱包密码
    walletRepsw: string; //钱包重复密码
    pswTip: string; //密码提示信息
    isCheck: boolean = true; //检查勾选协议状态,未勾选
    noCheck: boolean = false; //检查勾选协议状态未勾选
    isCre: boolean = false; //按钮处于可点击状态
    noCre: boolean = true; //按钮处于不可点击状态
    isComfire: boolean = false; // alert弹窗显示隐藏控制
    loading: any; //loading效果
    BDlist: any; //获取得到的钱包信息
    isBack: boolean = false; //页面返回按键
    walletType: string = "选择钱包类型"; //选择钱包类型

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NativeService,
        public actionSheetCtrl: ActionSheetController,
        private http: Http,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public navHttpfun: HttpService,) {
    }

    ionViewWillEnter() {
        //获取本地存储钱包数据的对象数组
        this.walletObject = this.navService.getObject('walletObject');

        if (this.walletObject.length <= 0 && this.navService.get('firstTo') === false) {
            this.isBack = true;
        }
        //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
        this.navService.tabHide()

    }


    ionViewWillLeave() {
        //解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
        this.navService.hide()
    }

    //调用接口,创建钱包
    CreWallet() {
        console.log("进入创建钱包方法中.........")
        /*正式环境 or 测试环境*/
        var chainUrl = APP_SERVER_BDC + "/restapi/wallet/createWallet"

        //比特钱包创建接口参数
        const bitcoin = require("bitcoinjs-lib");
        const Buffer = require('buffer');
        /*比特(BTC)类型*/

        var mailStr = this.navService.get('mailStr');
        if (this.walletName === null) {
            var str = "必须填写钱包名称!"
            this.navService.presentToast(str)
        } else {
            var verification = /^\d+$/;
            /*验证密码是否为纯数字*/
            if (this.walletPsw != this.walletRepsw) {
                var str = "密码与确认密码不一致!"
                this.navService.presentToast(str)
            } else if (this.walletPsw.length < 6) {
                var str = "密码长度必须是6位!"
                this.navService.presentToast(str)
            } else if (!verification.test(this.walletPsw)) {
                var str = "密码只能是6位数字!"
                this.navService.presentToast(str)
            } else {
                if (mailStr === null || mailStr === undefined) {
                    this.showConfirm()
                } else {
                    this.navService.show()
                    //调用接口
                    const crewallet = EthereumJsWallet.generate();
                    /*ETH*/

                    var timestamp = (new Date()).getTime(); //根据创建时的时间戳用以比特钱包创建字符

                    //调用比特钱包创建接口
                    const btchash = bitcoin.crypto.sha256(Buffer.Buffer.from(timestamp.toString()));
                    const keyPair = bitcoin.ECPair.fromPrivateKey(btchash)
                    var btcpriKey = keyPair.toWIF()
                    var btcpubKey = keyPair.publicKey
                    const address = bitcoin.payments.p2pkh({pubkey: btcpubKey})
                    /*BTC*/

                    var params = {
                        email: mailStr,
                        code: this.walletPsw,
                    }
                    /*BDC类型参数*/

                    //设置请求头,使参数以表单形式传递
                    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})

                    this.http.post(chainUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
                        this.BDlist = res.json();
                        if (this.BDlist.return_code === "FAIL") {
                            this.navService.hide()
                            var str = "创建失败,请重试";
                            this.navService.presentToast(str)
                        } else {
                            this.BDlist = this.BDlist.return_data;

                            /*加密钱包密码*/
                            var lockPsw = this.navService.compileStr(this.walletPsw)

                            //新增钱包数据
                            var newData = {
                                'walletName': this.walletName,
                                'walletPsw': lockPsw,
                                'ETHprivKey': crewallet.getPrivateKeyString(),
                                'ETHaddress': crewallet.getAddressString(),
                                'BTCprivKey': btcpriKey,
                                'BTCaddress': address.address,
                                'BDCprivKey': this.BDlist.privateKey,
                                'BDCaddress': this.BDlist.address,
                                'totalAssets': 0,
                                'integral': 0,
                                'force': 0
                            };

                            var walletUUID=this.navService.storageUuid(newData)

                            /*默认ETH账户*/
                            var ETH = {
                                'symbol': 'ETH',
                                'balance': 0,
                                'rmb': 0,
                                'address': crewallet.getAddressString(),
                                'contractadr': '0x000000000000000',
                                'name': 'ether',
                                'img': './assets/imgs/eth.png',
                                'selected': true
                            }

                            /*默认BTC账户*/
                            var BTC = {
                                'symbol': 'BTC',
                                'balance': 0,
                                'rmb': 0,
                                'address': address.address,
                                'contractadr': '0x000000000000000',
                                'name': 'Bitcoin',
                                'img': './assets/imgs/btc.png',
                                'selected': true
                            }

                            /*默认BDC账户*/
                            var BDC = {
                                'name': 'BDC',
                                trade: 0,
                                'icon': './assets/imgs/bdlogo.png',
                                'selected': true,
                                'address': this.BDlist.address,
                                'contractadr': '0x000000000000000'
                            }

                            /*默认HIT账户*/
                            var HIT = {
                                'symbol': 'HIT',
                                'balance': 0,
                                'rmb': 0,
                                'address': '0x7995ab36bb307afa6a683c24a25d90dc1ea83566',
                                'name': 'HITchain',
                                'img': './assets/imgs/HITchain.png',
                                'selected': true,
                                'contractadr': '0x7995ab36bb307afa6a683c24a25d90dc1ea83566',
                            }

                            var walletAssets=this.navService.get('walletAssets')
                            var dappData=this.navService.get('dappData')

                            this.navService.addAssest(walletUUID,ETH,walletAssets,'walletAssets')
                            this.navService.addAssest(walletUUID,BTC,walletAssets,'walletAssets')
                            this.navService.addAssest(walletUUID,HIT,walletAssets,'walletAssets')

                            this.navService.addAssest(walletUUID,BDC,dappData,'dappData')

                            // /*资产列表*/
                            // var assetsList = this.navService.getObject('assetsList')
                            // var bdcAssetslist = this.navService.getObject('bdcApplist')

                            // /*当前钱包首页列表*/
                            // var currentAssets = this.navService.getObject('currentAssets')
                            // var BDCcurrent = this.navService.getObject('currentApp')

                            // assetsList.push(ETH);
                            // currentAssets.push(ETH);
                            // assetsList.push(BTC);
                            // currentAssets.push(BTC);
                            // BDCcurrent.push(BDC);
                            // bdcAssetslist.push(BDC);
                            // assetsList.push(HIT);
                            // currentAssets.push(HIT);

                            // /*保存当前列表数据*/
                            // this.navService.setObject('assetsList', assetsList)

                            // this.navService.setObject('currentAssets', currentAssets)

                            // this.navService.setObject('currentApp', BDCcurrent)
                            
                            // this.navService.setObject('bdcApplist', bdcAssetslist)

                            // this.walletObject = this.navService.get("walletObject");
                            // //往数组添加新增钱包数据
                            // this.walletObject.push(newData);
                            // //保存数组
                            // this.navService.setObject('walletObject', this.walletObject);


                            if (this.navService.get('firstTo')) {
                                var walletuuid=this.navService.getObject('walletUuid')
                                this.navService.set('walletIndex', walletuuid[0])
                            }
                            console.log("创建方法完成............")

                            /*创建成功提示*/
                            var str = "创建成功"
                            this.navService.presentToast(str)
                            //创建成功后,自动返回首页
                            console.log(this.navService.get('firstRender'))
                            if (this.navService.get('firstRender')) {
                                this.navCtrl.setRoot(TabsPage);
                            }
                            else {
                                this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length() - 3))
                            }
                            this.navService.hide()
                        }

                    }, (error: Response) => {
                        this.navService.hide()
                        var str = "创建失败"
                        this.navService.presentToast(str)
                    })
                }
            }
        }
    }


    //检查是否勾选协议,若未勾选,则不允许创建
    check() {
        if (this.isCheck) {
            this.noCheck = true;
            this.isCheck = false;
            this.isCre = true;
            this.noCre = false;
        } else {
            this.noCheck = false;
            this.isCheck = true;
            this.isCre = false;
            this.noCre = true;
        }
    }

    //打开服务协议页面
    jumpPage() {
        var serveURL = APP_SERVER_BDC + "/editrecord/editrecordlist/getHtmlContent.do?type=4"
        this.http.request(serveURL).subscribe((res: Response) => {
            var content = res.json()
            content = content.bean
            this.navCtrl.push('ContentPage', {
                content: content,
            })
        })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad CrewalletPage');
    }

    //跳转导入钱包页面
    goImwallet() {
        this.navCtrl.push('SelectTypePage')
    }

    //弹出创建失败提示框
    showConfirm() {
        this.isComfire = true;

    }

    //隐藏提示框
    cancel() {
        this.isComfire = false;
    }

    //跳转到邮箱绑定页面
    goEmail() {
        this.isComfire = false
        this.navCtrl.push('EmailPage')
    }

    // 进入八斗云中心登录页
    goCenterLogin() {
        this.navCtrl.push('CenterloginPage')
    }

}
