import {Component} from '@angular/core';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {NativeService} from '../../../servies/Native.service';
import {erc20Abi} from '../../../servies/constants'
import Web3 from 'web3';
import {HttpService} from '../../../servies/Http.service';
import {APP_SERVER_BDC, APP_SERVER_ETH, APP_SERVER_ETH_NODE, UNION_URL} from '../../../servies/common.HttpUrl';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    createdCode: any = null; //存放生成二维码的数据
    scannedCode: any = null; //扫描二维码得到的数据
    walletTitle: String; //钱包名称
    walletAddress: string; //收款地址
    walletInfo: any; //存储获取到的钱包数据
    walletIndex: any = null; //钱包索引
    balance: any; //货币余额
    exchangeRate: any; //美元实时汇率
    reminbi: any; //人民币余额
    listDate: any; //ETH最新价值数据列表
    ETH: any = "ETH"; //ETH货币名称
    RMBexchangeRate: any; //人民币汇率
    RMBlist: any; //人民币汇率请求返回数据列表
    ETHURL: string = APP_SERVER_ETH + "/api?module=stats&action=ethprice&apikey=WCHP3FTSVXD3X2P2DN2CKWRT5B61X624YS"; //请求ETH最新价值数据URL
    totalAssets: any; //总资产
    stroageAsset: any = [];
    localAssets: any = []; //本地资产列表
    isETH: boolean = true; //判断当前钱包是否为以太类型
    isERC: boolean = true; //判断当前钱包是否为以太类型
    isBit: boolean = false; //判断当前钱包是否为比特类型
    isBD: boolean = true; //判断当前钱包是否为八斗类型
    firstStorage: any = []; //首次存储数据数组
    isEther: boolean = false;  //以太类型钱包
    isBDC: boolean = false;  //八斗类型钱包
    bitRmb: any; //人民币兑换比特币
    assetsStr: string = "总资产(¥)"; //总资产描述
    isAdd: boolean = true; //资产添加按钮是否显示
    appList: any = []; //BDC类型DAPP列表
    bdcApplist: any = []; //当前BDC类型DAPP列表
    CurrencyType: string; //货币类型
    setTime: any; //定时加载列表
    BtcRate: any = 100000000; //BTC转化率
    isComfire: boolean = false; // alert弹窗显示隐藏控制
    unionInvite: any = {};// bdc Union invite
    unionOrgName: string = null;
    alertTitle: string = "联盟邀请";
    isUnionOrgName: boolean = false;
    // 邀请加入联盟弹框底部的两个按钮
    cancelText: string = "拒绝";
    trueText: string = "同意";
    isQrCodeLogin: boolean = false;// 是否是二维码登录
    walletKey:any; //钱包数据对象key值数组

    // 加入联盟结果对象
    /* joinUnionObject: any = {
         isShow: false,
         title: '',
         text: '',
     }*/

    constructor(
        public navCtrl: NavController,
        private barcodeScanner: BarcodeScanner,
        public navService: NativeService,
        private navHttpfun: HttpService,
        private http: Http,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,) {
    }

    ionViewWillEnter() {
        // 测试用，打包请注释掉
        //防止使用tabHide方法后底部tab隐藏
        this.navService.tabShow()

        /*获取本地存储的钱包数据和钱包下标 总资产*/
        this.walletInfo = this.navService.get('walletSql')
        this.walletIndex = this.navService.get('walletIndex')
        this.walletKey=Object.keys(this.walletInfo)
        // 若出现没设置钱包索引,或者钱包索引错误的情况，则默认设为第一个
        if (this.walletIndex == null || this.walletIndex == undefined) {
            var walletuuid=this.navService.getObject('walletUuid')
            this.navService.set("walletIndex", walletuuid[0]);
        }
        this.totalAssets = this.walletInfo[this.walletIndex].totalAssets

        /*将首次渲染标记关闭*/
        if (this.navService.get('firstRender')) {
            this.navService.set('firstRender', false);
        }
    }

    ionViewDidEnter() {
        //定时器:定时发起请求渲染数据
        this.setTime = setTimeout(() => {
            if (this.walletInfo.length === 0) { /*防止钱包被全部删除后出现逻辑混乱*/
                var str = "当前无钱包,请创建或导入"
                this.navService.presentToast(str)
                this.navCtrl.push('CrewalletPage')
            } else {
                if (this.navService.get('firstTo')) { /*首次使用APP,显示的钱包为第一个*/
                    var walletuuid=this.navService.getObject('walletUuid')
                    this.navService.set('walletIndex', walletuuid[0]);
                    this.navService.set('firstTo', false);
                    this.walletIndex=walletuuid[0]
                    this.everyRender()
                    this.renderPage(walletuuid[0]);
                    this.renderList(walletuuid[0]);
                } else {
                    this.walletIndex = this.navService.get('walletIndex')
                    this.everyRender()
                    this.renderPage(this.walletIndex)
                    this.renderList(this.walletIndex)
                }
            }
        }, 500);
    }

    //获取当前钱包下所属数据(包括账户和DAPP)
    everyRender() {
        this.walletInfo=this.navService.get('walletSql')
        this.walletIndex=this.navService.get('walletIndex')
        this.stroageAsset = this.navService.get('walletAssets');
        this.localAssets = [];
        this.appList = [];
        this.totalAssets = 0

        //BDC类型是否存在
        if (this.walletInfo[this.walletIndex].BDCaddress != null && this.walletInfo[this.walletIndex].BDCaddress != undefined) {
            this.isBDC = true;
            this.bdcApplist = this.navService.get('dappData')
            this.bdcApplist=this.bdcApplist[this.walletIndex]
            this.appList = []
            for (var i = 0; i < this.bdcApplist.length; i++) { /*将BDC类型DAPP添加首页列表*/
                if (this.bdcApplist[i].selected) {
                    this.appList.push(this.bdcApplist[i])
                }
            }
        }

        this.stroageAsset=this.stroageAsset[this.walletIndex]
        //ETH类型是否存在
        if (this.walletInfo[this.walletIndex].ETHaddress != null && this.walletInfo[this.walletIndex].ETHaddress != undefined) {
            this.isEther = true;
            
            for (var a = 0; a < this.stroageAsset.length; a++) { /*将ETH类型资产添加首页列表*/
                if (this.stroageAsset[a].selected && this.stroageAsset[a].address != this.walletInfo[this.walletIndex].BTCaddress) {
                    this.localAssets.push(this.stroageAsset[a])
                }
            }
            //将当前资产列表存储在本地,用以交易记录赋予单位
            this.navService.setObject('unitList', this.localAssets)
        }

        //BTC类型是否存在
        if (this.walletInfo[this.walletIndex].BTCaddress != null && this.walletInfo[this.walletIndex].BTCaddress != undefined) {
            this.isEther = true;
            for (var aa = 0; aa < this.stroageAsset.length; aa++) { /*将BTC类型资产添加首页列表*/
                if (this.stroageAsset[aa].address === this.walletInfo[this.walletIndex].BTCaddress && this.stroageAsset[aa].selected) {
                    this.localAssets.push(this.stroageAsset[aa])
                }
            }
        }

    }


    ionViewWillLeave() {
        //解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
        this.navService.hide()
        /*更新当前钱包本地资产数据*/
        this.walletInfo = this.navService.get("walletSql")

        this.walletInfo[this.walletIndex].totalAssets = this.totalAssets
        this.navService.set('walletSql', this.walletInfo)
    }



    //侧边栏选择渲染钱包
    selectWallet(index) {
        this.walletTitle = this.walletInfo[index].walletName; //标题
        this.navService.set('walletIndex', index)
        /*更新本地当前钱包下标*/

        this.walletIndex = index;
        this.everyRender()
        this.renderPage(this.walletIndex)

        /*侧边栏选择钱包后延时更新*/
        setTimeout(() => {
            this.renderList(this.walletIndex)
        }, 50)

    }

    // 二维码id
    qrCodeId: string = null

    //扫描二维码并输出内容
    scanCode() {
        this.barcodeScanner.scan().then(barcodeData => {
            /*将扫描得到的数据转为json格式*/
            this.scannedCode = barcodeData.text;
            this.scannedCode = JSON.parse(this.scannedCode)
            // scan the walletAddress
            if (this.scannedCode != null && this.scannedCode.walletAddress != undefined) {
                this.navCtrl.push('TransferPage', {
                    address: this.scannedCode.assetsAddress,
                    amount: this.scannedCode.amount,
                    walletAddress: this.scannedCode.walletAddress,
                    CurrencyType: this.scannedCode.CurrencyType,
                })
            }
            // sacn the bdcunion and join it
            if (this.scannedCode.email != null && this.scannedCode.invitationCode != null) {
                // the invitationCode`s type is {email:email,invitationCode:invitationCode,unionName:unionName,roleType:roleType,inviter:inviter}
                this.unionInvite = this.scannedCode;
                var obj=Object.keys(this.walletInfo)
                var find=function(walletIndex,obj){
                    for(var i=0;i<obj.length;i++){
                        if(walletIndex===obj[i]){
                            return true
                        }
                    }
                    return false
                }
                var isEmpty=find(this.walletIndex,obj)
                if(!isEmpty){
                    var walletUuid=this.navService.getObject('walletUuid')
                    this.walletIndex=walletUuid[0]
                }
                //get email
                var email = this.walletInfo[this.walletIndex].email; //标题
                if (email == null) {
                    var str = "当前钱包绑定的八斗帐号暂不支持加入联盟"
                    this.navService.presentToast(str)
                }
                // 重置数据
                this.alertTitle = '联盟邀请'
                this.unionOrgName = '';
                this.isUnionOrgName = false;
                this.showConfirm();
            }
            // 扫码登录

            if (this.scannedCode.action == 'qrCodeLogin') {
                this.qrCodeId = this.scannedCode.qrCodeId;
                this.oepnQrCodeLogin();
            }

        }, (err) => {
            var str = "您的二维码不正确"
            this.navService.presentToast(str)
        });
    }


    // 打开二维码登录云中心确认页面
    oepnQrCodeLogin() {
        var obj=Object.keys(this.walletInfo)
        var find=function(walletIndex,obj){
            for(var i=0;i<obj.length;i++){
                if(walletIndex===obj[i]){
                    return true
                }
            }
            return false
        }
        var isEmpty=find(this.walletIndex,obj)
        if(!isEmpty){
            var walletUuid=this.navService.getObject('walletUuid')
            this.walletIndex=walletUuid[0]
        }
        //get email
        var email = this.walletInfo[this.walletIndex].email;
        if (email == null) {
            var str = "当前钱包绑定的八斗帐号暂不支持扫码登录"
            this.navService.presentToast(str)
            return
        }
        // 发送请求
        // request url
        var scanUrl = APP_SERVER_BDC + "/restapi/qrLogin/scanQrCode"
        //  发送扫码请求
        //设置请求头,使参数以表单形式传递
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        var params = {
            qrCodeId: this.qrCodeId
        }
        this.navService.show()
        this.http.post(scanUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
            this.navService.hide()
            var result = res.json()
            this.cancel();
            if (result.return_code == "SUCCESS") {
                this.isQrCodeLogin = true
            } else {
                this.navService.presentToast('扫码登录出错')
            }
        }, (error: Response) => {
            this.navService.hide()
            this.cancel();
            this.navService.presentToast('网络出错')
        })
    }

    // 确认登录
    qrCodeLogin() {
        var scanUrl = APP_SERVER_BDC + "/restapi/qrLogin/confirmLogin"
        //  发送扫码请求
        //设置请求头,使参数以表单形式传递
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        var params = {
            qrCodeId: this.qrCodeId,
            loginId: this.walletInfo[this.walletIndex].email
        }
        this.navService.show()
        this.http.post(scanUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
            this.navService.hide()
            var result = res.json()
            this.cancel();
            if (result.return_code == "SUCCESS") {
                this.navService.presentToast('登录成功')
            } else {
                this.navService.presentToast('登录出错')
            }
        }, (error: Response) => {
            this.navService.hide()
            this.cancel();
            this.navService.presentToast('网络出错')
        })
    }

    // 取消云中心扫码登录
    cancelLogin() {
        this.isQrCodeLogin = false
        var cancelUrl = APP_SERVER_BDC + "/restapi/qrLogin/cancelLogin"
        //  发送扫码请求
        //设置请求头,使参数以表单形式传递
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        var params = {
            qrCodeId: this.qrCodeId,
        }
        this.http.post(cancelUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
        }, (error: Response) => {
            this.navService.presentToast('网络出错')
        })
    }

    //跳转到创建钱包页面
    goCrewallet() {
        this.navCtrl.push('CrewalletPage')
    }


    //跳转到选择导入类型页面
    goSelecttype() {
        this.navCtrl.push("SelectTypePage", {
            isaccount: true,
        })
    }


    //跳转到新增资产页面
    goAssetslist() {
        this.navCtrl.push('AssetslistPage')
    }

    //渲染账户&DAPP列表
    renderList(index) {
        this.totalAssets = parseFloat(this.totalAssets)


        if (this.localAssets.length != 0) {
            for (var i = 0; i < this.localAssets.length; i++) {
                if (this.localAssets[i].address === this.walletInfo[index].ETHaddress) { /*根据资产的地址判断*/
                    this.renderETH(i, index)
                } else if (this.localAssets[i].address === this.walletInfo[index].BTCaddress) {
                    this.renderBit(i, index)
                } else {
                    this.renderERC(i, index)
                }
            }
        }

        if (this.appList.length != 0) { /*BDC账户和DAPP*/
            this.renderBDC();
        }

    }

    //默认ETH资产信息
    renderETH = (i, index) => {
        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE);

        const web3 = new Web3(web3HttpProvider);

        //请求ETH最新价值数据列表
        this.http.request(this.ETHURL)
            .subscribe((res: Response) => {

                this.RMBexchangeRate = this.navService.get('RMBexchangeRate')
                this.listDate = res.json(); //将得到的数据转化为json
                this.exchangeRate = this.listDate.result.ethusd; //赋予美元汇率

                //调用接口处理余额
                web3.eth.getBalance(this.walletInfo[index].ETHaddress, (error, weiBalance) => {
                    if (error) { //失败提示(暂定失败处理)
                        var str = "网络出错"
                        this.navService.presentToast(str)
                    } else { //成功处理
                        this.balance = weiBalance.toNumber()
                        this.balance = web3.fromWei(this.balance, 'ether') //转化ETH币的个数
                        this.reminbi = Number((this.balance * this.exchangeRate * this.RMBexchangeRate).toString().match(/^\d+(?:\.\d{0,2})?/)); //转化人民币,只保留两位小数

                        this.localAssets[i] = {
                            'symbol': this.ETH,
                            'balance': this.balance,
                            'rmb': this.reminbi,
                            'address': this.walletInfo[index].ETHaddress,
                            'name': 'ETH',
                            'img': this.localAssets[i].img,
                            'belong': index,
                            'selected': this.localAssets[i].selected
                        };

                        this.totalAssets = parseFloat(this.totalAssets)

                        this.totalAssets = parseFloat(this.totalAssets + parseFloat(this.localAssets[i].rmb)).toFixed(2)
                        /*总资产计算*/

                        for (var Subscript = 0; Subscript < this.stroageAsset.length; Subscript++) {
                            if (this.stroageAsset[Subscript].address === this.localAssets[i].address && this.stroageAsset[Subscript].belong === this.localAssets[i].belong) {
                                this.stroageAsset[Subscript] = this.localAssets[i]
                            }
                        }
                    }
                });
            }, (error: Response) => {
                this.navService.hide()
                var str = "网络出错"
                this.navService.presentToast(str)
            });
    }

    //BTC资产信息
    renderBit = (i, index) => {
        //比特币接口配置
        var bitURL = "https://api.blockcypher.com/v1/btc/main/addrs/" + this.walletInfo[index].BTCaddress + "/balance"
        this.bitRmb = this.navService.get('bitExchange')

        this.http.request(bitURL)
            .subscribe((res: Response) => {
                var list = res.json();
                if (list != null) {
                    list.balance = list.balance / this.BtcRate
                    var RMB = (list.balance / this.bitRmb).toFixed(2)
                    this.localAssets[i] = {
                        'symbol': 'BTC',
                        'balance': list.balance,
                        'rmb': RMB,
                        'address': list.address,
                        'name': 'Bit',
                        'img': this.localAssets[i].img,
                        'belong': this.localAssets[i].belong,
                        'selected': this.localAssets[i].selected
                    }

                    this.totalAssets = parseFloat(this.totalAssets)

                    this.totalAssets = parseFloat(this.totalAssets + parseFloat(this.localAssets[i].rmb)).toFixed(2)

                    for (var Subscript = 0; Subscript < this.stroageAsset.length; Subscript++) {
                        if (this.stroageAsset[Subscript].address === this.localAssets[i].address && this.stroageAsset[Subscript].belong === this.localAssets[i].belong) {
                            this.stroageAsset[Subscript] = this.localAssets[i]
                        }
                    }
                }
            }, (error: Response) => {
                var str = "网络出错"
                this.navService.presentToast(str)
            })
    }


    renderERC = (i, index) => {
        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)
        const web3 = new Web3(web3HttpProvider);

        var decimalsBalance = web3.eth.contract(erc20Abi).at(this.localAssets[i].address)
            .balanceOf(this.walletInfo[index].ETHaddress);

        var ERCbalance = decimalsBalance.toNumber();

        ERCbalance = web3.fromWei(ERCbalance, 'ether')
        this.reminbi = Number((ERCbalance * this.exchangeRate * this.RMBexchangeRate).toString().match(/^\d+(?:\.\d{0,2})?/)); //转化人民币,只保留两位小数
        this.localAssets[i] = {
            'symbol': this.localAssets[i].symbol,
            'balance': ERCbalance,
            'rmb': this.reminbi,
            'address': this.localAssets[i].address,
            'decimals': this.localAssets[i].decimals,
            'name': this.localAssets[i].name,
            'img': this.localAssets[i].img,
            'belong': index,
            'selected': this.localAssets[i].selected
        };

        this.totalAssets = parseFloat(this.totalAssets)

        this.totalAssets = parseFloat(this.totalAssets + parseFloat(this.localAssets[i].rmb)).toFixed(2)
        /*总资产计算*/

        for (var Subscript = 0; Subscript < this.stroageAsset.length; Subscript++) {
            if (this.stroageAsset[Subscript].address === this.localAssets[i].address && this.stroageAsset[Subscript].belong === this.localAssets[i].belong) {
                this.stroageAsset[Subscript] = this.localAssets[i]
            }
        }
    }


    //BDC账户&DAPP信息渲染
    renderBDC = () => {
        for (var i = 0; i < this.appList.length; i++) {
            if (this.appList[i].address) { /*BDC账户*/
                this.getBDCassets(i)
            } else { /*DAPP*/
                this.getBDC(i)
            }
        }
    }

    //BDC DAPP信息获取
    getBDC(i) {
        /*生产环境 or 测试环境 */
        var getUrl = APP_SERVER_BDC + "/restapi/wallet/app/" + this.appList[i].appId + "/summary"

        //设置请求头,使参数以表单形式传递
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        var params = {
            address: this.walletInfo[this.walletIndex].BDCaddress,
        }
        this.http.post(getUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {

            var BDClist = res.json()
            if (BDClist.return_code != "FAIL") {

                BDClist = BDClist.return_data;
                this.appList[i].isShare = BDClist.isShare
                this.appList[i].trade = BDClist.trade

                for (var index = 0; index < this.bdcApplist.length; index++) {
                    if (this.bdcApplist[index].appId === this.appList[i].appId) {
                        this.bdcApplist[index] = this.appList[i]
                    }
                }
                this.navService.setObject('currentApp', this.bdcApplist)
            } else {
                this.navService.presentToast(BDClist.return_msg)
            }
        }, (error: Response) => {
            var str = "网络出错"
            this.navService.presentToast(str)
        })
    }

    //默认BDC账户信息
    getBDCassets(i) {
        this.appList[i].trade = this.walletInfo[this.walletIndex].integral

        //测试环境
        var getInfoUrl = APP_SERVER_BDC + "/restapi/wallet/getBdcInfo?address=" + this.appList[i].address

        this.navService.setObject('walletObject', this.walletInfo)
        this.http.request(getInfoUrl).subscribe((res: Response) => {
            var datalist = res.json()
            if (datalist.return_code === "FAIL") {
                this.appList[i].trade = 0
            } else {
                this.appList[i].trade = datalist.return_data.integral
                this.walletInfo[this.walletIndex].force = datalist.return_data.force
                this.walletInfo[this.walletIndex].integral = datalist.return_data.integral
                if (this.appList[i].trade === 0) {
                    this.appList[i].trade = 0
                } else {
                    this.appList[i].trade = parseFloat(this.appList[i].trade).toFixed(2)
                }
                for (var index = 0; index < this.bdcApplist.length; index++) {
                    if (this.bdcApplist[index].address === this.appList[i].address && this.bdcApplist[index].belong === this.appList[i].belong) {
                        this.bdcApplist[index] = this.appList[i]
                    }
                }
                this.navService.setObject('currentApp', this.bdcApplist)
            }
        }, (error: Response) => {

        })
    }


    //渲染页面
    renderPage(index) {
        //获取本地钱包数据
        // this.walletInfo = this.navService.get('walletSql');

        //将钱包基本信息渲染到页面
        this.walletTitle = this.walletInfo[index].walletName; //标题
    }


    //跳转到某个货币交易记录列表
    goAssetsinfo(index) {
        var hash;
        var balance;
        var rmb;
        var dealTitle;
        var name;
        var decimals
        if (this.localAssets[index] && this.localAssets[index].address === this.walletInfo[this.walletIndex].BTCaddress) {
            this.CurrencyType = "BTC"
            hash = this.localAssets[index].address
            balance = this.localAssets[index].balance
            rmb = this.localAssets[index].rmb
            dealTitle = this.localAssets[index].symbol
        } else {
            if (this.localAssets[index].address === this.walletInfo[this.walletIndex].ETHaddress) {
                this.CurrencyType = "ETH"
                hash = this.localAssets[index].address
                balance = this.localAssets[index].balance
                rmb = this.localAssets[index].rmb
                name = this.localAssets[index].symbol
            } else {
                this.CurrencyType = "ERC"
                hash = this.localAssets[index].address
                balance = this.localAssets[index].balance
                rmb = this.localAssets[index].rmb
                decimals = this.localAssets[index].decimals
                dealTitle = this.localAssets[index].symbol
            }
        }

        /*跳转交易列表页面及页面参数传递*/
        this.navCtrl.push('AssetsinfoPage', {
            balance: balance,
            rmb: rmb,
            hash: hash,
            CurrencyType: this.CurrencyType,
            name: name,
            dealTitle: dealTitle,
            decimals: decimals,
        })
    }

    //BDC跳转交易列表按钮点击事件
    goBDCassetsInfo(index) {
        var share;
        var hash;
        var dealTitle;
        var BdcTrans;
        if (this.appList[index]) {
            this.CurrencyType = "BdIntegral"
            if (this.appList[index].address) {
                hash = this.appList[index].address
                BdcTrans = true;
                /*BDC积分交易标识*/
            } else {
                hash = this.appList[index].appId
            }
            dealTitle = this.appList[index].name
            share = this.appList[index].isShare
        }
        this.navCtrl.push('AssetsinfoPage', {
            hash: hash,
            CurrencyType: this.CurrencyType,
            share: share,
            dealTitle: dealTitle,
            name: name,
            BdcTrans: BdcTrans,
            trade: this.appList[index].trade
        })
    }

    //下拉刷新数据
    doRefresh(refresher) {
        setTimeout(() => {
            this.walletIndex = this.navService.get('walletIndex');
            this.walletTitle = this.walletInfo[this.walletIndex].walletName; //标题

            this.everyRender()
            this.renderPage(this.walletIndex)
            this.renderList(this.walletIndex)
            refresher.complete();
        }, 2000);
    }

    //隐藏提示框
    cancel() {
        this.isComfire = false;
        this.isQrCodeLogin = false
    }


//弹出joinunion框
    showConfirm() {
        this.isComfire = true;

    }


    //join union
    joinUnion() {

        if (this.alertTitle == "填写信息") {
            if (this.unionOrgName == null) {
                this.navService.presentToast("请填写组织名")
                return;
            }
            //获取本地钱包数据
            this.walletInfo = this.navService.get('walletSql');
            var obj=Object.keys(this.walletInfo)
            var find=function(walletIndex,obj){
                for(var i=0;i<obj.length;i++){
                    if(walletIndex===obj[i]){
                        return true
                    }
                }
                return false
            }
            var isEmpty=find(this.walletIndex,obj)
            if(!isEmpty){
                var walletUuid=this.navService.getObject('walletUuid')
                this.walletIndex=walletUuid[0]
            }
            //get email
            var email = this.walletInfo[this.walletIndex].email; //标题
            // check the email
            /* this.unionInvite = {
                 "unionName": "fsafsaffczxc",
                 "inviter": "lps26@lps.com",
                 "roleType": "核心成员",
                 "email": "363914894@qq.com",
                 "invitationCode": "2CPQMJ"
             };*/
            if (email != this.unionInvite.email) {
                this.cancel();
                this.navService.presentToast('您不是该邀请码邀请的对象')
                return;
            }
            // request url
            var jounUrl = UNION_URL + "/restapi/union/joinUnion"

            //设置请求头,使参数以表单形式传递
            let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
            var params = {
                invitationCode: this.unionInvite.invitationCode, email: email, orgName: this.unionOrgName
            }
            this.navService.show()
            this.http.post(jounUrl, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
                this.navService.hide()
                var jounResult = res.json()
                var msg = ''
                if (jounResult.return_code == "SUCCESS") {
                    msg = '加入联盟成功';
                } else {
                    msg = jounResult.return_msg;
                }
                this.cancel();
                this.navService.presentToast(msg)
            }, (error: Response) => {
                this.navService.hide()
                this.cancel();
                this.navService.presentToast('网络出错')
            })
        } else {
            this.alertTitle = "填写信息"
            this.isUnionOrgName = true;
            this.trueText = '加入';
            this.cancelText = "取消"
        }

    }


    // 进入八斗云中心登录页
    goCenterLogin() {
        this.navCtrl.push('CenterloginPage')
    }


}