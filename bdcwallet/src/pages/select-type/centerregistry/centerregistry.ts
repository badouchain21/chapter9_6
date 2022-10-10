import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../../servies/Http.service';
import {Headers, RequestOptions} from '@angular/http';
import {TabsPage} from '../../tabs/tabs';
import {APP_SERVER_BDC} from '../../../servies/common.HttpUrl';
import {NativeService} from '../../../servies/Native.service';
import {Http,} from '@angular/http';

/**
 * Generated class for the CenterregistryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-centerregistry',
    templateUrl: 'centerregistry.html',
})
export class CenterregistryPage {


    ionViewDidLoad() {
        console.log('ionViewDidLoad CenterregistryPage');
    }


    userName: string = null; //用户名
    psw: string = null; //密码
    comfirePsw: string = null; //确认密码
    authCode: string = null; //授权码
    headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'}); //设置请求头,使参数以表单形式传递
    email: string = null;
    str: string = '';

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private http: Http,
        private navHttp: HttpService,
        public navService: NativeService) {
    }


    ionViewDidEnter() {
    }

    ionViewWillLeave() {
    }

    //注册
    registry() {
        this.navService.show()
        if (!this.userName || !this.psw || !this.comfirePsw || !this.authCode || !this.email) {
            this.navService.hide()
            this.str = "信息未填写完整"
            this.navService.presentToast(this.str)
        } else {
            /*检测email格式*/
            var myreg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;

            var sixNumberReg = /^\d{6}\b/;
            if (this.psw != this.comfirePsw) {
                this.str = "两次输入的密码不一致"
                this.navService.presentToast(this.str)
                this.navService.hide()
                return;
            } else {
                if (this.email === "") {
                    this.str = "email不能为空"
                    this.navService.hide()
                    this.navService.presentToast(this.str)
                    return;
                } else if (!myreg.test(this.email)) {
                    this.str = "请输入正确的email"
                    this.navService.hide()
                    this.navService.presentToast(this.str)
                    return;
                } else if (this.psw.length < 6) {
                    this.str = "最少输入六位密码"
                    this.navService.hide()
                    this.navService.presentToast(this.str)
                    return;
                } else if (!sixNumberReg.test(this.authCode)) {
                    this.str = "请输入六位纯数字授权码"
                    this.navService.hide()

                    this.navService.presentToast(this.str)
                    return;
                } else {
                    /*注册URL*/
                    var registryUrl = APP_SERVER_BDC + "/restapi/user/register"

                    var params = {
                        userName: this.userName,
                        password: this.psw,
                        email: this.email,
                        authCode: this.authCode
                    }

                    this.http.post(registryUrl, this.navHttp.toBodyString(params), new RequestOptions({headers: this.headers}))
                        .subscribe((res) => {
                            var returnData = res.json()
                            this.navService.hide()
                            if (returnData.return_code === "SUCCESS") {

                                var str = "注册成功";
                                this.navService.presentToast(str)

                                var data = returnData.return_data;
                                /* create a new wallet object */
                                var newWallet = {
                                    'walletName': data.name, 'walletPsw': this.navService.compileStr(this.authCode),
                                    'BDCprivKey': data.privateKey, 'BDCaddress': data.address,
                                    'totalAssets': 0, 'integral': 0, 'force': 0, 'email': this.email, isBdcLogin: true
                                };

                                /*create a bdc account */
                                var BDC = {
                                    'name': 'BDC',
                                    trade: 0,
                                    'icon': './assets/imgs/bdlogo.png',
                                    'selected': true,
                                    'address': data.address,
                                    'contractadr': '0x000000000000000',
                                    'email': this.email
                                }

                                var uuid=this.navService.storageUuid(newWallet)
                                var dappData=this.navService.get('dappData')
                                this.navService.addAssest(uuid,BDC,dappData,"dappData")
                                // var bdcAssetslist = this.navService.getObject('bdcApplist')
                                // var BDCcurrent = this.navService.getObject('currentApp')
                                // bdcAssetslist.push(BDC)
                                // BDCcurrent.push(BDC)
                                // walletObject.push(newWallet)
                                /*save data to local db*/
                                // this.navService.setObject('currentApp', BDCcurrent)
                                // this.navService.setObject('bdcApplist', bdcAssetslist)
                                // this.navService.setObject('walletObject', walletObject);
                                // 更新当前钱包的索引
                                this.navService.set('walletIndex', uuid)
                                // bind email
                                this.navService.set('mailStr', this.email)
                                // go homePage
                                this.navCtrl.setRoot(TabsPage)
                            } else {
                                this.navService.presentToast(returnData.return_msg);
                            }
                            this.navService.hide()
                        }, (error) => {
                            this.navService.hide()
                            var str = "注册失败:网络出错";
                            this.navService.presentToast(str)
                        })
                }
            }
        }
    }


}
