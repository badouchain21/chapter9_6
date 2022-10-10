import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController} from 'ionic-angular';
import {NativeService} from '../../../../servies/Native.service';
import {HttpService} from '../../../../servies/Http.service';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import Web3 from 'web3';
import ProviderEngine from 'web3-provider-engine';
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet';
import ProviderSubprovider from 'web3-provider-engine/subproviders/provider';
import EthereumJsWallet from 'ethereumjs-wallet';
import {erc20Abi} from '../../../../servies/constants'
import {APP_SERVER_BDC, APP_SERVER_ETH_NODE} from '../../../../servies/common.HttpUrl';


@IonicPage()
@Component({
    selector: 'page-transfer',
    templateUrl: 'transfer.html',
})
export class TransferPage {
    title = "转账" //标题
    receiveData: any; //扫码得到的数据
    TransAddress: string; //转账地址
    amount: any; //转账余额金额
    isDisplay: boolean = false; //点击显示输入密码框
    password: string; //钱包密码
    walletIndex: any; //当前钱包索引
    walletList: any = []; //本地钱包数据列表
    isDeal: boolean = false; //确认是否交易
    payType: string = "转账"; //支付类型
    fromWallet: string; //付款钱包
    wallet: any; //当前钱包对象
    brightness: any = 0; //滑动条变化值
    gasPrice: any; //矿工费用单价
    gasETH: any; //矿工费用转化为ETH
    multiple: any; //倍数
    dealHash: string; //交易hash
    contractAddress: string; //ERC20合约地址
    ERChash: string; //ERChash地址
    decimals: any; //精度
    Bithash: string; //比特hash
    bitdeal: any; //比特交易记录列表
    isETH: boolean; //滚动条是否存在
    loading: any; //loading效果
    balance: any; //余额
    bitRmb: any; //人民币兑换比特币
    ercAssets: string;
    amout: any;  //金额
    isHeader: boolean; //头部显示状态
    ethDeal: boolean; //eth交易
    ercDeal: boolean; //erc交易
    btcDeal: boolean; //btc交易
    eth: boolean;  //扫码获取的eth交易类型
    btc: boolean; //扫码获取的btc交易类型
    pswone: string; //密码输入框1
    pswtwo: string; //密码输入框2
    pswothree: string; //密码输入框3
    pswfour: string; //密码输入框4
    pswfive: string; //密码输入框5
    pswsix: string; //密码输入框6
    oneStr: string = '1'; //数字键1
    twoStr: string = '2'; //数字键2
    threeStr: string = '3'; //数字键3
    fourStr: string = '4'; //数字键4
    fiveStr: string = '5'; //数字键5
    sixStr: string = '6'; //数字键6
    sevenStr: string = '7'; //数字键7
    eightStr: string = '8'; //数字键8
    nineStr: string = '9'; //数字键9
    zeroStr: string = '0'; //数字键10
    pswIndex: any; //密码索引
    BdcTrans: boolean; //BDC交易
    bdcTrade: string; //BDC积分余额
    CurrencyType: string; //货币类型
    BtcRate: any = 100000000; //BTC转化率
    gasValue: any; //gas价值
    setPsw: any = {
        isSetPsw: false,
        psw: null,
        comfirmPsw: null
    }

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NativeService,
        private http: Http,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public navHttpfun: HttpService,) {
    }

    ionViewWillEnter() {
        this.pswIndex = 0 //初始化密码长度

        /*获取货币类型*/
        this.CurrencyType = this.navParams.get('CurrencyType')


        this.isHeader = true;
        /*获取页面传递的参数*/
        this.TransAddress = this.navParams.get('walletAddress'); //转账地址
        this.amount = this.navParams.get('amount'); //转账金额
        this.contractAddress = this.navParams.get('address') //ERC20合约地址
        this.bdcTrade = this.navParams.get('bdcTrade') //BDC积分余额

        this.dealHash = this.navParams.get('hash'); //交易hash
        this.decimals = this.navParams.get('decimals') //ERC类型精度
        this.balance = this.navParams.get('balance') //账户余额

        /*获取本地钱包数据和当前钱包下标*/
        this.walletIndex = this.navService.get('walletIndex');
        this.walletList = this.navService.get('walletSql')


        /*根据类型选择*/
        switch (this.CurrencyType) {
            case "ETH":
                this.Slider()
                console.log("ETHdeal")
                break;
            case "ERC":
                this.Slider()
                console.log("ERCdeal")
                break;
            case "BTC":
                this.isETH = false
                console.log("BTCdeal")
                break;
            case "BdcTrans":
                this.isETH = false
                console.log("BDCdeal")
                break;
            default:
                // code...
                break;
        }
    }

    ionViewWillLeave() {
        //解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
        this.navService.hide()
        this.isHeader = false;
        this.isDeal = false;
    }

    //滑动条事件控制--根据货币类型选择是否开启
    Slider() {
        this.isETH = true;
        setTimeout(() => {
            this.change()
        }, 500)
    }


    //比特钱包交易
    BITpay() {
        this.isDeal = false;
        var creDealUrl = "https://api.blockcypher.com/v1/btc/main/txs/new"
        this.amout = parseFloat(this.amount)
        this.amout = (this.amout * this.BtcRate).toFixed(0)
        this.amout = parseInt(this.amout)
        var dealObject = {
            "inputs": [{"addresses": [this.walletList[this.walletIndex].BTCaddress]}],
            "outputs": [{"addresses": [this.TransAddress], "value": this.amout}]
        };
        this.navService.show()
        this.http.post(creDealUrl, JSON.stringify(dealObject)).subscribe((res: Response) => {
            this.bitdeal = res.json();
            console.log(this.bitdeal)
            this.navService.hide()
            if (this.bitdeal != null) {
                this.sendDeal(this.bitdeal)
            }
        }, (error: Response) => {
            this.navService.hide()
            var str = "网络出错"
            this.navService.presentToast(str)

        })
    }


    sendDeal(tmptx) {
        const Buffer = require('buffer');
        const bip66 = require('bip66');
        const bitcoin = require('bitcoinjs-lib-3.3.2');
        var testError = null;
        const token = "206c5309f2aa4c3f86374793b49407c9";
        var privKey = this.walletList[this.walletIndex].BTCprivKey

        var sendDealUrl = "https://api.blockcypher.com/v1/btc/main/txs/send?token=" + token
        //测试网络是否联通
        const testnet = bitcoin.networks.bitcoin;
        try {
            const keys = bitcoin.ECPair.fromWIF(
                this.walletList[this.walletIndex].BTCprivKey,
                testnet
            );
        } catch (error) {
            testError = error
        }
        if (testError === null) {
            const keys = bitcoin.ECPair.fromWIF(
                this.walletList[this.walletIndex].BTCprivKey,
                testnet
            );
            const tosign = tmptx.tosign
            tmptx.pubkeys = [];

            /*正式环境 or 测试环境*/
            var tosignURL = APP_SERVER_BDC + "/restapi/wallet/transaction/signBTCTransaction"

            var params = {
                privateKey: this.walletList[this.walletIndex].BTCprivKey,
                tosign: tosign
            }
            //设置请求头,使参数以表单形式传递
            let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})

            this.http.post(tosignURL, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
                var signed = res.json()
                if (signed.return_code === "SUCCESS") {
                    signed = signed.return_data
                    tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString("hex"));
                    tmptx.signatures = []
                    tmptx.signatures.push(signed)
                    this.http.post(sendDealUrl, tmptx).subscribe((res: Response) => {
                        var return_data = res.json()
                        // var bit = true
                        var amout = parseFloat(this.amount)
                        var total = "-" + amout

                        this.navService.hide()

                        /*跳转交易详情页面及页面参数传递*/
                        this.navCtrl.push('DealPage', {
                            hash: return_data.tx.hash,
                            CurrencyType: this.CurrencyType,
                            total: total
                        })
                    }, (error: Response) => {
                        var str = "交易失败"
                        this.navService.presentToast(str)
                    })
                } else {
                    var str = "签名失败"
                    this.navService.presentToast(str)
                }
            }, (error: Response) => {

            })

            this.navService.show()
        } else {
            var str = "交易出错"
            this.navService.presentToast(str)
        }


    }


    //以太钱包交易
    ETHpay() {
        this.isDeal = false;
        var priKey = this.walletList[this.walletIndex].ETHprivKey.slice(2)
        const wallet = EthereumJsWallet.fromPrivateKey(Buffer.from(priKey, 'hex'));
        var httpError = false; //出错检测

        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)


        // const web = new Web3(web3HttpProvider);
        var engine;

        engine = new ProviderEngine();

        try {
            engine.addProvider(new WalletSubprovider(wallet, {}));

            engine.addProvider(new ProviderSubprovider(web3HttpProvider));

            engine.start();
            engine.stop()
        } catch (error) {
            httpError = error
            console.log(httpError)
            engine.stop()
        }

        if (!httpError) { //出错时不进入
            engine.addProvider(new WalletSubprovider(wallet, {}));

            engine.addProvider(new ProviderSubprovider(web3HttpProvider));

            engine.start();

            const web3 = new Web3(engine);

            web3.eth.defaultAccount = wallet.getAddressString();

            this.navService.show()
            console.log(this.CurrencyType)
            if (this.CurrencyType === "ETH") {
                web3.eth.sendTransaction(
                    {
                        to: this.TransAddress,
                        value: web3.toWei(this.amount),
                        gasPrice: this.gasPrice
                    },
                    (error, transaction) => {
                        if (error) {
                            this.navService.hide()
                            engine.stop();
                            var str = "交易失败"
                            this.navService.presentToast(str)
                        } else {
                            this.navService.hide()

                            /*跳转交易详情页面及页面参数传递*/
                            this.navCtrl.push('DealPage', {
                                hash: transaction,
                                CurrencyType: this.CurrencyType
                            });

                        }

                        engine.stop();
                    },);

            } else {
                var url
                if (this.contractAddress != null) {
                    url = this.contractAddress
                } else {
                    url = this.dealHash
                }
                this.amount = parseFloat(this.amount)
                console.log(this.amount);

                web3.eth
                    .contract(erc20Abi)
                    .at(url)
                    .transfer(
                        this.TransAddress,
                        this.amount * Math.pow(10, this.decimals),
                        (error, transaction) => {
                            if (error) {
                                this.navService.hide()
                                engine.stop();
                                var str = "交易失败"
                                this.navService.presentToast(str)
                            } else {
                                /*跳转交易详情页面及页面参数传递*/
                                this.navCtrl.push('DealPage', {
                                    hash: transaction,
                                    CurrencyType: this.CurrencyType
                                });
                                this.navService.hide()
                            }

                            engine.stop();
                        },
                    );
            }
            engine.stop();
        }

    }

    //BDC积分交易
    BDCpay() {
        var currentApp = this.navService.getObject('currentApp')
        var trade = 0;

        for (var index = 0; index < currentApp.length; index++) { /*获取当前BDC积分余额*/
            if (currentApp[index].address === this.walletList[this.walletIndex].BDCaddress) {
                trade = currentApp[index].trade
            }
        }
        if (trade < this.amount) {
            var str = "积分不足"
            this.navService.presentToast(str)
        } else {
            this.navService.show()

            /* 正式环境 or 测试环境*/
            var bdc_trans_url = APP_SERVER_BDC + "/restapi/wallet/transferAccounts"

            /*组装post数据*/
            var params = {
                payAddress: this.walletList[this.walletIndex].BDCaddress,
                receiveAddress: this.TransAddress,
                payKey: this.password,
                integral: this.amount,
                reason: null,
            }
            //设置请求头,使参数以表单形式传递
            let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
            this.http.post(bdc_trans_url, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
                var isDeal = res.json()
                if (isDeal.return_code === "SUCCESS") {
                    isDeal = isDeal.return_data
                    this.navCtrl.push('DealPage', {
                        hash: isDeal.integralLogId,
                        CurrencyType: this.CurrencyType
                    })
                } else {
                    this.navService.presentToast(isDeal.return_msg)
                }
                this.navService.hide()
            }, (error: Response) => {
                this.navService.hide()
                var str = "交易失败"
                this.navService.presentToast(str)
            })
        }
    }

    //确认支付按钮点击事件
    enterPay() {
        console.log(this.CurrencyType)
        /*根据类型选择*/
        switch (this.CurrencyType) {
            case "ETH":
                this.ETHpay()
                break;
            case "ERC":
                this.ETHpay()
                break;
            case "BTC":
                this.BITpay()
                break;
            case "BdcTrans":
                this.BDCpay()
                break;

            default:
                // code...
                break;
        }
    }

    //取消支付返回点击事件
    cancelPay() {
        this.isDisplay = false;
        this.isDeal = false;
    }


    //滑动条滑动事件
    onchange(brightness) {
        if (brightness === 50) {
            this.multiple = 1
        } else if (brightness < 50) {
            this.multiple = brightness * 2 * 0.01

        } else {
            this.multiple = 1 + (brightness * 2 * 0.01)

        }
        this.multiple = parseFloat(this.multiple)
        this.gasETH = parseFloat(this.gasETH)
        this.gasValue = (this.multiple * this.gasETH).toFixed(15)
    }

    //转账下一步点击事件
    nextStep() {
        if(!this.TransAddress||!this.amount){
            this.navService.presentToast("请完善转账信息")
            return
        }
        if (this.balance < this.amount) {
            var str = "余额不足"
            this.navService.presentToast(str)
        } else {

            this.isDisplay = true;
            /*初始化*/
            this.isDeal = false;
            this.pswfour = null;
            this.pswfive = null;
            this.pswone = null;
            this.pswtwo = null;
            this.pswsix = null;
            this.pswothree = null;
            this.pswIndex = 0
        }
    }

    // 取消设置支付密码
    cancelSetPsw() {
        this.setPsw.isSetPsw = false;
    }


    //确认密码按钮点击事件
    enterInfo() {
        this.isDisplay = false;
        // bdc交易特殊处理，不需要输入支付密码而需要输入授权码
        if (this.CurrencyType == 'BdcTrans') {
            this.isDeal = true;
            this.fromWallet = this.walletList[this.walletIndex].BDCaddress
        } else {
            var psw = this.walletList[this.walletIndex].walletPsw;
            /*解密钱包密码*/
            var unlockPsw = this.navService.uncompileStr(psw)
            if (this.password === unlockPsw) {
                this.isDeal = true;
                /*选择付款地址*/
                switch (this.CurrencyType) {
                    case "ETH":
                        this.fromWallet = this.walletList[this.walletIndex].ETHaddress
                        break;
                    case "ERC":
                        this.fromWallet = this.walletList[this.walletIndex].ETHaddress
                        break;
                    case "BTC":
                        this.fromWallet = this.walletList[this.walletIndex].BTCaddress
                        break;
                    default:
                        // code...
                        break;
                }
            } else {
                var str = "密码错误"
                this.navService.presentToast(str)

            }
        }

    }


    //点击金额输入框滑动条改变事件
    change() {
        this.brightness = 50;
        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)
        const web = new Web3(web3HttpProvider);
        this.gasPrice = web.eth.gasPrice
        this.gasETH = web.fromWei(this.gasPrice.c, 'ether')
        this.gasETH = parseFloat(this.gasETH)
        this.multiple = 1
        this.multiple = parseFloat(this.multiple)
        this.gasETH = parseFloat(this.gasETH)
        this.gasValue = (this.multiple * this.gasETH).toFixed(15)
    }

    //点击数字键盘输入密码
    inputPsw(value) {
        if (this.pswIndex <= 6) { //密码长度为6位
            this.pswIndex++;
            /*数字输入显示到页面上*/
            switch (this.pswIndex) {
                case 1:
                    this.pswone = value;
                    break;
                case 2:
                    this.pswtwo = value;
                    break;
                case 3:
                    this.pswothree = value;
                    break;
                case 4:
                    this.pswfour = value;
                    break;
                case 5:
                    this.pswfive = value;
                    break;
                case 6:
                    this.pswsix = value;
                    break;
                default:
                    break;
            }
        }

        /*当密码长度最大时,组装密码,并且判断和进入下一步骤*/
        if (this.pswIndex === 6) {
            this.password = this.pswone.toString() + this.pswtwo.toString() + this.pswothree.toString() +
                this.pswfour.toString() + this.pswfive.toString() + this.pswsix.toString()
            this.enterInfo()
        }
    }

    //删除密码
    deletePsw() {
        if (this.pswIndex === 7) {
            this.pswIndex = 6
        }
        if (this.pswIndex >= 1) {
            switch (this.pswIndex) {
                case 1:
                    this.pswone = null;
                    this.pswIndex--;
                    break;
                case 2:
                    this.pswtwo = null;
                    this.pswIndex--;
                    break;
                case 3:
                    this.pswothree = null;
                    this.pswIndex--;
                    break;
                case 4:
                    this.pswfour = null;
                    this.pswIndex--;
                    break;
                case 5:
                    this.pswfive = null;
                    this.pswIndex--;
                    break;
                case 6:
                    this.pswsix = null;
                    this.pswIndex--;
                    break;
                default:
                    break;
            }
        }

    }
}



