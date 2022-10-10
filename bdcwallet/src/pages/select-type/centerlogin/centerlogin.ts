import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../../servies/Http.service';
import {Headers, RequestOptions} from '@angular/http';
import {TabsPage} from '../../tabs/tabs';
import {NativeService} from '../../../servies/Native.service';
import {APP_SERVER_BDC} from '../../../servies/common.HttpUrl';
import {Http,} from '@angular/http';

/**
 * Generated class for the CenterloginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-centerlogin',
    templateUrl: 'centerlogin.html',
})
export class CenterloginPage {

    loginId: string = null; //用户账号
    psw: string = null; //用户密码
    headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'}); //设置请求头,使参数以表单形式传递
    walletObject: any = [];
    str: string = '';

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private http: Http,
        private navHttp: HttpService,
        public navService: NativeService) {
    }

    ionViewWillEnter() {
        // this.walletObject = this.navService.getObject('walletObject')
    }


    ionViewDidEnter() {
    }


    //跳转到注册页面
    goRegistry() {
        this.navCtrl.push('CenterregistryPage')
    }


    //登录
    login() {
        this.navService.show()
        console.log(this.loginId + "," + this.psw)
        if (!this.loginId || !this.psw) {
            this.navService.hide()
            this.str = "登录信息未填写完整"
            this.navService.presentToast(this.str)
        } else {
            /*登录URL*/
            var loginUrl = APP_SERVER_BDC + "/restapi/user/login"
            this.http.post(loginUrl, this.navHttp.toBodyString({
                email: this.loginId,
                password: this.psw
            }), new RequestOptions({headers: this.headers}))
                .subscribe((res) => {
                    var returnData = res.json()
                    console.log(returnData)
                    this.navService.hide()
                    if (returnData.return_code === "SUCCESS") {
                        this.str = "登录成功"
                        this.navService.presentToast(this.str)
                        var data = returnData.return_data;
                        var index = this.findBDC(data.address);
                        if (index == -1) {
                            // bind email
                            this.navService.set('mailStr', this.loginId)
                            var newWallet = {
                                'walletName': data.name,
                                'BDCprivKey': data.privateKey, 'BDCaddress': data.address,
                                'totalAssets': 0, 'integral': 0, 'force': 0, 'email': this.loginId, isBdcLogin: true
                            };
                            /*默认BDC账户*/
                            var BDC = {
                                'name': 'BDC',
                                trade: 0,
                                'icon': './assets/imgs/bdlogo.png',
                                'selected': true,
                                'address': data.address,
                                'contractadr': '0x000000000000000',
                                'email': this.loginId
                            }

                            var uuid=this.navService.storageUuid(newWallet)
                            var dappData=this.navService.get('dappData')
                            this.navService.addAssest(uuid,BDC,dappData,"dappData")

                            // get assetslist and bdcCurrent  from local db
                            // var bdcAssetslist = this.navService.getObject('bdcApplist')
                            // var BDCcurrent = this.navService.getObject('currentApp')
                            // push BDCAssets
                            // bdcAssetslist.push(BDC)
                            // BDCcurrent.push(BDC)
                            // this.walletObject.push(newWallet)

                            /*save data to local db*/
                            // this.navService.setObject('currentApp', BDCcurrent)
                            // this.navService.setObject('bdcApplist', bdcAssetslist)
                            // this.navService.setObject('walletObject', this.walletObject);
                            // 设置钱包的索引
                            this.navService.set('walletIndex', uuid)
                        } else {
                            this.navService.set('walletIndex', index)
                        }
                        //
                        this.navCtrl.setRoot(TabsPage)
                    } else {
                        this.str = returnData.return_msg;
                        this.navService.presentToast(this.str)
                    }
                }, (error) => {
                    this.navService.hide()
                    this.str = "登录失败:网络出错"
                    this.navService.presentToast(this.str)
                })

        }
    }

    findBDC(address) {
        var walletSql=this.navService.get('walletSql')
        var obj=Object.keys(walletSql)

        for (var i = 0; i < obj.length; i++) {
            if (walletSql[obj[i]].BDCaddress === address) {
                return obj[i];
            }
        }
        return -1
    }


}
