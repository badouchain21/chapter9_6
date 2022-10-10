import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage,NavController,NavParams,LoadingController,ToastController,ActionSheetController,AlertController } from 'ionic-angular';
import {Http, Response} from '@angular/http';
import {Headers, RequestOptions} from '@angular/http';
import {NativeService} from '../../../../servies/Native.service';
import {FormGroup, FormControl} from '@angular/forms';
import {HttpService} from '../../../../servies/Http.service';
import Web3 from 'web3';
import ECharts from 'echarts';
import {APP_SERVER_BDC, APP_SERVER_ETH, APP_SERVER_ETH_NODE} from '../../../../servies/common.HttpUrl';

@IonicPage()
@Component({
    selector: 'page-assetsinfo',
    templateUrl: 'assetsinfo.html',
})
export class AssetsinfoPage {
    @ViewChild('chart') chart: ElementRef;

    title: string = "ETH"; //标题
    /*控制footer是否存在*/
    isFooter: boolean = true;
    walletAddress: string; //收款地址
    //获取当前钱包Eth货币交易数据列表URL
    ETH_Trans_url: string;
    ERC_Trans_url: string;
    dataList: any; //当前钱包货币交易数据中的result数据
    walletInfo: any; //存储获取到的钱包数据
    hash: string; //交易hash
    value: string; //交易数量
    timeStamp: string; //交易时间戳
    from: string; //交易来源地址,转账方的钱包地址
    to: string; //交易来源地址,收款方的钱包地址
    list: any; //存储当前钱包Eth货币交易列表
    balance: any; //货币余额
    rmb: any; //人民币余额
    ETHERSCAN_API_KEY: string = "WCHP3FTSVXD3X2P2DN2CKWRT5B61X624YS"
    loading: any;  //加载等待效果
    walletIndex: any; //当前钱包索引
    ERClist: any = []; //ERC列表
    isETH: boolean; //是否为以太类型
    isERC: boolean; //是否为ERC类型
    isBit: boolean = false; //是否为bit类型
    selected: string = "Transaction"; //选择为已交易或未确认
    content: string = "选择交易记录类型";
    comfireList: any = []; //btc交易记录列表
    BTCcomfireList: any = [] //btc交易记录渲染列表
    BitList: any = []; //bit列表
    isOnelist: boolean = false; //以太类型记录列表是否存在
    isBD: boolean = false; //是否为八斗类型
    isOther: boolean = false; //其他类型
    BDCinfo: any = []; //应用详细信息
    BDCinfolist: any = [] //应用详细信息列表
    BDCdataList: any = []; //BDC页面渲染列表
    isComfire: boolean = false; // alert弹窗显示隐藏控制
    testRadioOpen: boolean;
    testRadioResult: string;
    isShare: boolean; //共享状态
    noShare: boolean; //不共享状态
    getshare: any = 0; //设置共享状态
    getnoshare: any = 1; //设置不共享状态
    langs; //共享选择列表
    langForm; //共享选择表单
    transdecimals: any;  //ERC精度
    isERCdeal: boolean = false;
    contractAddress: string; //erc20合约地址
    addPages: any; //加载页数
    ETHdataList: any = []; //eth交易列表数据
    endLoad: boolean = false; //上拉加载显示状态
    qrAddress: string; //收款二维码地址
    before: string; //BTC交易分页标识
    BDCPages: any; //BDC分页加载
    BTCstoragelist: any = []; //btc数据存储列表
    portSign: string; //BDC接口标识
    BDCwalletaddress: string; //BDC钱包地址
    BDCExist: boolean = false; //应用接口进入列表显示状态
    BdcTrans: boolean = false; //BDC交易
    BDCtrade: string; //BDC积分
    integralList: any; //BDC积分交易数据列表
    integralRnder: any = []; //BDC积分交易数据渲染列表
    CurrencyType: string; //货币类型
    count: any = []; //用户数量数组_应用数据
    date: any = []; //日期数组_应用数据
    isChart: boolean = false; //图表显示状态
    canEdit: boolean = true // 是否显示交易总数 共享按钮
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public navService: NativeService,
        private http: Http,
        public navHttpfun: HttpService,
        public loadingCtrl: LoadingController,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,) {
        //构造共享选择表单
        this.langForm = new FormGroup({
            "langs": new FormControl()
        });
    }

    ionViewWillEnter() {
        //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
        this.navService.tabHide()
        this.walletIndex = this.navService.get('walletIndex'); //当前钱包索引
        //获取本地钱包数据
        this.walletInfo = this.navService.get('walletSql');
        this.balance = this.navParams.get('balance');
        this.rmb = this.navParams.get('rmb')
        this.hash = this.navParams.get('hash')
        this.canEdit = this.navParams.get("canEdit") == null ? true : this.navParams.get("canEdit")

        /*获取货币类型*/
        this.CurrencyType = this.navParams.get('CurrencyType')

        this.transdecimals = this.navParams.get('decimals')
        this.portSign = this.navParams.get('portSign') //应用接口页面得到的参数
        this.BDCwalletaddress = this.navParams.get('BDCwallet') //应用接口页面得到的参数

        if (this.navParams.get('dealTitle') != null) {
            this.title = this.navParams.get('dealTitle')
        } else {
            this.title = this.navParams.get('name')
        }
        this.isBD = this.navParams.get('isBD')

        /*获取BDC转账标识*/
        this.BdcTrans = this.navParams.get('BdcTrans')
        if (this.BdcTrans) {
            this.isBD = false;
        }

        if (this.navParams.get('share')) {
            this.noShare = true;
        } else {
            this.isShare = true
        }
    }

    //BDC图表数据
    initChart() {
        let element = this.chart.nativeElement;
        element.style.width = (document.body.clientWidth) + 'px';//设置容器宽度
        let myChart = ECharts.init(element);
        myChart.setOption({
            tooltip: {
                trigger: 'axis',
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.date,
                    splitNumber: 2,
                    splitLine: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(78, 93, 111, 0.8)',
                        }
                    },
                }
            ],
            yAxis: {
                type: 'value',
                splitNumber: 2,
                splitLine: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: 'rgba(78, 93, 111, 0.8)'
                    }
                },
            },
            series: [{
                name: 'count',
                type: 'line',
                symbol: 'circle',
                data: this.count,
                symbolSize: 6,
                smooth: false,   //关键点，为true是不支持虚线的，实线就用true
                lineStyle: {
                    normal: {
                        color: '#38c2d2',
                        width: 1,
                        type: 'dashed'
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#337d86',
                    }
                },

            }]
        });
    }

    ionViewDidEnter() {
        //底部按钮显示
        this.isFooter = true;
        console.log(this.CurrencyType)
        /*根据货币类型选择相应的请求方法和渲染方法*/
        switch (this.CurrencyType) {
            case "ETH":
                this.isOnelist = true;
                this.isOther = true;
                this.isBit = false;
                this.addPages = 1
                this.qrAddress = this.walletInfo[this.walletIndex].ETHaddress
                this.ETHdataList = []
                this.renderETH(this.addPages);
                break;
            case "ERC":
                this.isOnelist = true
                this.isOther = true;
                this.isBit = false;
                this.addPages = 1
                this.qrAddress = this.walletInfo[this.walletIndex].ETHaddress
                this.ETHdataList = []
                this.renderERC(this.addPages);
                break;
            case "BTC":
                this.isBit = true
                this.isOther = true;
                this.isOnelist = false;
                this.qrAddress = this.walletInfo[this.walletIndex].BTCaddress
                this.before = null
                this.BTCcomfireList = []
                this.renderBit(this.before);
                break;
            case "BdIntegral":
                this.isBD = true;
                this.isFooter = false;
                this.isBit = false;
                this.BDCPages = 1
                this.BDCdataList = []
                this.BdcTrans = this.navParams.get('BdcTrans')
                if (this.BdcTrans) {
                    this.CurrencyType = "BdcTrans"
                    this.isFooter = true
                    this.BDCtrade = this.navParams.get('trade')
                    /*获取BDC账户积分余额*/
                    this.isBD = false;
                }
                this.renderBDC(this.BDCPages)
                break;

            default:
                // code...
                break;
        }

    }

    //页面离开时隐藏底部按钮
    ionViewWillLeave() {
        //解决点击手机自带返回按钮退出页面时,loading效果仍在的bug
        this.navService.hide()
        this.isFooter = false;

        /*
          清空数据列表
        */
        this.dataList = []
        this.ETHdataList = []
        this.BDCinfolist = []
        this.BDCdataList = []
        this.BTCcomfireList = []
        this.comfireList = []
        this.BTCstoragelist = []
        this.integralRnder = []
        this.integralList = []
    }

    //ETH交易记录
    renderETH(addpages) {
        this.dataList = []
        this.navService.show()
        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE);

        const web3 = new Web3(web3HttpProvider);

        //获取当前钱包的合约地址
        this.walletAddress = this.walletInfo[this.walletIndex].ETHaddress

        /*以太请求 测试环境 or 正式环境*/
        this.ETH_Trans_url = APP_SERVER_ETH + "/api?module=account&action=txlist&startblock=0&endblock=99999999&page=" + addpages + "&offset=10&address=" + this.walletAddress + "&sort=desc&apikey=" + "WCHP3FTSVXD3X2P2DN2CKWRT5B61X624YS"

        //获取当前钱包Eth货币交易列表
        this.http.request(this.ETH_Trans_url).subscribe((res: Response) => {
            this.list = res.json(); //转化为json
            if (this.list.status === 0) { //请求不到数据时,使用本地数据
                this.endLoad = true;
            } else {
                this.dataList = this.list.result
                var temporaryList = this.dataList
                this.dataList = []
                console.log(temporaryList)
                for (var n = 0; n < temporaryList.length; n++) {
                    this.dataList.push(temporaryList[n])
                }
                for (var i = 0; i < this.dataList.length; i++) {
                    //将时间戳转换为时间格式
                    this.dataList[i].timeStamp = new Date(parseInt(this.dataList[i].timeStamp) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                    if (this.dataList[i].timeStamp === "Invalid Date" || this.dataList[i].timeStamp === null || this.dataList[i].timeStamp === undefined) {
                        this.comfireList[i].confirmed = "交易正在确认中..."
                    }
                    //将单位转为以太货币类型
                    this.dataList[i].value = web3.fromWei(this.dataList[i].value, 'ether')
                    this.dataList[i].value = this.dataList[i].value.toLocaleString()
                    //判断交易为进账或者出账
                    if (this.dataList[i].from === this.walletAddress) {
                        this.dataList[i].value = "-" + this.dataList[i].value //出账
                    } else {
                        this.dataList[i].value = "+" + this.dataList[i].value //进账
                    }
                    this.ETHdataList.push(this.dataList[i])
                }
            }
            this.navService.hide();
        }, (error: Response) => {
            this.navService.hide()
            var str = "获取数据失败,请检查网络"
            this.navService.presentToast(str)
        });
    }

    //ERC交易记录
    renderERC(addpages) {
        this.navService.show()
        this.dataList = []
        //以太环境配置
        var web3HttpProvider = new Web3.providers.HttpProvider(APP_SERVER_ETH_NODE)

        const web3 = new Web3(web3HttpProvider);
        //获取当前钱包的合约地址
        this.walletAddress = this.walletInfo[this.walletIndex].ETHaddress

        /*以太请求 测试环境 or 正式环境*/
        this.ERC_Trans_url = APP_SERVER_ETH + "/api?module=account&action=tokentx&contractaddress=" + this.hash + "&address=" + this.walletAddress + "&page=" + addpages + "&offset=100&sort=desc&apikey=YourApiKeyToken"

        this.http.request(this.ERC_Trans_url)
            .subscribe((res: Response) => {
                this.dataList = res.json();
                this.dataList = this.dataList.result;
                if (this.dataList.length === 0) {
                    this.endLoad = true;
                } else {
                    for (var i = 0; i < this.dataList.length; i++) {
                        var value = this.dataList[i].value = this.dataList[i].input.slice(74) //将金额的16进制从input取出
                        value = parseInt(value, 16) //将16进制的金额转为10进制

                        this.dataList[i].value = value / Math.pow(10, this.transdecimals); //将金额除于当前资产的精度
                        this.dataList[i].value = this.dataList[i].value.toLocaleString() //转化金额数字,会丢失一些精度
                        //将时间戳转换为时间格式
                        this.dataList[i].timeStamp = new Date(parseInt(this.dataList[i].timeStamp) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');

                        if (this.dataList[i].timeStamp === "Invalid Date" || this.dataList[i].timeStamp === null || this.dataList[i].timeStamp === undefined) {
                            this.comfireList[i].confirmed = "交易正在确认中..."
                        }
                        //判断交易为进账或者出账
                        if (this.dataList[i].from === this.walletInfo[this.walletIndex].ETHaddress) {
                            this.dataList[i].value = "-" + this.dataList[i].value //出账
                        } else {
                            this.dataList[i].value = "+" + this.dataList[i].value //进账
                        }
                        this.ETHdataList.push(this.dataList[i])
                    }
                }
                this.navService.hide();
            }, (error: Response) => {
                this.navService.hide()
                var str = "获取数据失败,请检查网络"
                this.navService.presentToast(str)
            });
        this.isERCdeal = true;
        this.contractAddress = this.hash
    }

    //bit交易记录
    renderBit(before) {
        this.navService.show()
        this.comfireList = []
        var dealURL = "https://api.blockcypher.com/v1/btc/main/addrs/" + this.hash + "/full?limit=10&before=" + before
        this.http.request(dealURL).subscribe((res: Response) => {
            this.BitList = res.json()
            console.log(this.BitList)
            this.balance = this.BitList.balance / 100000000;
            this.comfireList = this.BitList.txs
            if (this.BitList.txs.length === 0) {
                this.endLoad = true;
            } else {
                console.log(this.comfireList)
                for (var i = 0; i < this.comfireList.length; i++) {
                    this.comfireList[i].total = 0;
                    if (this.comfireList[i].confirmed === null || this.comfireList[i].confirmed === undefined) {
                        this.comfireList[i].confirmed = "交易正在处理"
                    }
                    this.comfireList[i].confirmed = new Date(this.comfireList[i].confirmed).getTime(); //将获取的时间格式转为时间戳
                    this.comfireList[i].confirmed = this.comfireList[i].confirmed / 1000
                    /*将时间戳转为常见的时间格式*/
                    this.comfireList[i].confirmed = new Date(parseInt(this.comfireList[i].confirmed) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                    if (this.comfireList[i].confirmed === "Invalid Date" || this.comfireList[i].confirmed === null || this.comfireList[i].confirmed === undefined) {
                        this.comfireList[i].confirmed = "交易正在处理"
                    }

                    var isExist = this.forEach(this.comfireList[i].inputs)
                    if (isExist) { //收款
                        for (var j = 0; j < this.comfireList[i].outputs.length; j++) {
                            for (var n = 0; n < this.comfireList[i].outputs[j].addresses.length; n++) { //inputs数组中的address数组
                                //找到outputs中对应自己地址的金额,全部加起来为收款金额
                                if (this.walletInfo[this.walletIndex].BTCaddress === this.comfireList[i].outputs[j].addresses[n]) {
                                    this.comfireList[i].total = this.comfireList[i].total + this.comfireList[i].outputs[j].value;
                                }
                            }
                        }
                        this.comfireList[i].total = "+" + this.comfireList[i].total / 100000000
                    } else {
                        var inNumber = 0;
                        var outNumber = 0;
                        for (var j = 0; j < this.comfireList[i].outputs.length; j++) {
                            for (var n = 0; n < this.comfireList[i].outputs[j].addresses.length; n++) { //inputs数组中的address数组
                                //将outputs中存在自己地址的金额全部加起来
                                if (this.walletInfo[this.walletIndex].BTCaddress === this.comfireList[i].outputs[j].addresses[n]) {
                                    outNumber = outNumber + this.comfireList[i].outputs[j].value;
                                }
                            }
                        }
                        for (var j = 0; j < this.comfireList[i].inputs.length; j++) {
                            for (var n = 0; n < this.comfireList[i].inputs[j].addresses.length; n++) { //inputs数组中的address数组
                                //将inputs中存在自己地址的金额全部加起来
                                if (this.walletInfo[this.walletIndex].BTCaddress === this.comfireList[i].inputs[j].addresses[n]) {
                                    inNumber = inNumber + this.comfireList[i].inputs[j].output_value;
                                }
                            }
                        }
                        if (inNumber > outNumber) {  //判断为收款或发款,inputs中金额大于outputs,则为发款
                            //发款
                            for (var j = 0; j < this.comfireList[i].outputs.length; j++) {
                                for (var n = 0; n < this.comfireList[i].outputs[j].addresses.length; n++) { //inputs数组中的address数组
                                    //找到outputs中对应自己地址的金额,全部加起来为发款金额
                                    if (this.walletInfo[this.walletIndex].BTCaddress != this.comfireList[i].outputs[j].addresses[n]) {
                                        this.comfireList[i].total = this.comfireList[i].total + this.comfireList[i].outputs[j].value;
                                    }
                                }
                            }
                            this.comfireList[i].total = "-" + this.comfireList[i].total / 100000000
                        } else {
                            //收款
                            for (var j = 0; j < this.comfireList[i].outputs.length; j++) {
                                for (var n = 0; n < this.comfireList[i].outputs[j].addresses.length; n++) { //inputs数组中的address数组
                                    //找到outputs中对应自己地址的金额,全部加起来为收款金额
                                    if (this.walletInfo[this.walletIndex].BTCaddress === this.comfireList[i].outputs[j].addresses[n]) {
                                        this.comfireList[i].total = this.comfireList[i].total + this.comfireList[i].outputs[j].value;
                                    }
                                }
                            }
                            this.comfireList[i].total = "+" + this.comfireList[i].total / 100000000
                        }
                    }
                    this.BTCstoragelist.push(this.comfireList[i])
                    this.BTCcomfireList = this.BTCstoragelist
                }
            }
            this.navService.hide();
        }, (error: Response) => {
            this.navService.hide()
            var str = "获取数据失败,请检查网络"
            this.navService.presentToast(str)
        })

    }

    //遍历当前钱包地址是否存在于inputs中的address数组中
    forEach(Transfer) {
        for (var i = 0; i < Transfer.length; i++) {
            for (var n = 0; n < Transfer[i].addresses.length; n++) { //inputs数组中的address数组
                if (this.walletInfo[this.walletIndex].BTCaddress === Transfer[i].addresses[n]) { //判断当前钱包地址是否存在于inputs数组中
                    return false; //存在
                }
            }
        }
        return true; //不存在则说明是收款方
    }

    //八斗交易记录
    renderBDC(pages) {
        this.navService.show()
        if (this.BdcTrans) { //积分交易
            this.integralList = []

            /*测试环境 or 生产环境*/
            var getRecording = APP_SERVER_BDC + "/restapi/wallet/bdcTransferList?address=" + this.walletInfo[this.walletIndex].BDCaddress + "&pageNum=" + pages + "&pageSize=10"

            this.http.request(getRecording).subscribe((res: Response) => {
                this.integralList = res.json()
                console.log(this.integralList)
                if (this.integralList.return_data.total === 0) {
                    this.endLoad = true;
                } else {
                    if (this.integralList.return_code === "SUCCESS") {
                        this.integralList = this.integralList.return_data.data
                        for (var i = 0; i < this.integralList.length; i++) {
                            if (this.integralList[i].transferStatus === "确认中") {
                                this.integralList[i].transactionHash = "交易正在确认中..."
                            }
                            this.integralList[i].createTime = this.integralList[i].createTime / 1000
                            this.integralList[i].createTime = new Date(parseInt(this.integralList[i].createTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                            if (this.integralList[i].fromAddress === this.walletInfo[this.walletIndex].BDCaddress) {
                                this.integralList[i].integral = "-" + this.integralList[i].integral
                            } else {
                                this.integralList[i].integral = "+" + this.integralList[i].integral
                            }
                            this.integralRnder.push(this.integralList[i])
                        }
                    }
                }
                this.navService.hide()
            }, (error: Response) => {
                this.navService.hide()
            })
        } else { //应用调试
            this.BDCinfo = []
            this.isChart = true;
            this.BDCinfolist = []
            if (this.portSign === "interface") {
                this.BDCExist = true;
                this.isBD = false;

                /*生产环境 or 测试环境 */
                var detailistURL = APP_SERVER_BDC + "/restapi/wallet/transaction/" + this.BDCwalletaddress + "/transactionsByAdd/" + this.hash + "?pageNum=" + pages + "&pageSize=10"
            } else {

                /*生产环境 or 测试环境 */
                var detailistURL = APP_SERVER_BDC + "/restapi/wallet/app/" + this.hash + "/transactions?pageNum=" + pages + "&pageSize=10"
            }


            /*生产环境 or 测试环境 */
            var dealURL = APP_SERVER_BDC + "/restapi/wallet/app/" + this.hash + "/detail"

            this.http.request(dealURL).subscribe((res: Response) => {
                this.BDCinfo = res.json()
                console.log(this.BDCinfo)
                this.BDCinfo = this.BDCinfo.return_data
                var lenght = this.BDCinfo.lastWeekLogCount.length
                for (var i = 0; i < lenght; i++) {
                    this.count[i] = this.BDCinfo.lastWeekLogCount[lenght - i - 1].count
                    this.date[i] = this.BDCinfo.lastWeekLogCount[lenght - i - 1].date.slice(5)
                }
                console.log(this.count)
                console.log(this.date)

                this.initChart()
                if (this.BDCinfo.trade === null || this.BDCinfo.trade === undefined) {
                    this.BDCinfo.trade = 0
                }
                if (this.BDCinfo.accountCount === null || this.BDCinfo.accountCount === undefined) {
                    this.BDCinfo.accountCount = 0
                }
            }, (error: Response) => {
                var str = "获取BDC应用信息失败"
                this.navService.presentToast(str)
            });

            this.http.request(detailistURL).subscribe((res: Response) => {
                this.BDCinfolist = res.json()
                if (this.BDCinfolist.return_code != "SUCCESS") {
                    this.endLoad = true;
                } else {
                    this.BDCinfolist = this.BDCinfolist.return_data.rows;
                    for (var i = 0; i < this.BDCinfolist.length; i++) {
                        if (this.BDCinfolist[i].status === 0) {
                            this.BDCinfolist[i].status = "成功"
                        } else {
                            this.BDCinfolist[i].status = "失败"
                        }
                        this.BDCdataList.push(this.BDCinfolist[i])
                    }
                }
                this.navService.hide();
            }, (error: Response) => {
                this.navService.hide()
                var str = "获取BDC账户数据失败"
                this.navService.presentToast(str)
            })
        }
    }


    //跳转到交易详情页面
    goDeal(index) {
        var hash;
        var decimals;
        var total;
        var txreceipt_status;
        if (this.BTCcomfireList[index] != null) {
            hash = this.BTCcomfireList[index].hash
            total = this.BTCcomfireList[index].total
        } else {
            hash = this.ETHdataList[index].hash
            decimals = this.transdecimals
            txreceipt_status = this.ETHdataList[index].txreceipt_status
        }

        this.navCtrl.push('DealPage', {
            total: total,
            CurrencyType: this.CurrencyType,
            hash: hash,
            decimals: decimals,
            isERC: this.isERCdeal,
            txreceipt_status: txreceipt_status
        })
    }

    //跳转到BDC积分交易详情页面
    integralDeal(index) {
        this.navCtrl.push("DealPage", {
            hash: this.integralRnder[index].integralLogId,
            CurrencyType: this.CurrencyType,
        })
    }

    //跳转到转账页面
    goTransfer() {
        this.navCtrl.push('TransferPage', {
            hash: this.hash,
            decimals: this.transdecimals,
            balance: this.balance,
            address: this.contractAddress,
            CurrencyType: this.CurrencyType,
            bdcTrade: this.BDCtrade
        })

    }

    //跳转到收款页面
    goIncome() {
        this.navCtrl.push('IncomePage', {
            CurrencyType: this.CurrencyType
        })
    }


    //选择交易记录类型点击事件
    selectType() {
        const actionSheet = this.actionSheetCtrl.create({
            title: '选择交易记录类型',
            buttons: [
                {
                    text: '已交易记录',
                    handler: () => {
                        this.selected = "Transaction";
                        this.content = "已交易记录"
                        this.BTCcomfireList = []
                        /*筛选已交易记录*/
                        for (var j = 0; j < this.BTCstoragelist.length; j++) {
                            if (this.BTCstoragelist[j].confirmations != 0) {
                                this.BTCcomfireList.push(this.BTCstoragelist[j])
                            }
                        }
                    }
                }, {
                    text: '未确认记录',
                    handler: () => {
                        this.selected = "Notraded"
                        this.content = "未确认记录"
                        this.BTCcomfireList = []
                        /*筛选微交易记录*/
                        for (var j = 0; j < this.BTCstoragelist.length; j++) {
                            if (this.BTCstoragelist[j].confirmations === 0) {
                                this.BTCcomfireList.push(this.BTCstoragelist[j])
                            }
                        }
                    }
                }, {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    //隐藏alert弹窗
    cancel() {
        this.isComfire = false;
        // this.isQr=false;
    }

    //更改共享状态点击事件
    changeState() {
        this.isComfire = true;
        // this.isQr=false;
    }

    //共享按钮点击事件
    showRadio() {
        this.isComfire = true;
    }

    //确认共享选择事件
    shareSelect() {
        this.isComfire = false;

        /* 生产环境 or 测试环境 */
        var putURL = APP_SERVER_BDC + "/restapi/wallet/app/" + this.hash + "/status"
        var params = {
            isShare: this.langForm.value.langs
        }
        console.log(params)
        //设置请求头,使参数以表单形式传递
        let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})
        this.http.put(putURL, this.navHttpfun.toBodyString(params), new RequestOptions({headers: headers})).subscribe((res: Response) => {
        }, (error: Response) => {
            var str = "请求出错"
            this.navService.presentToast(str)
        })
        event.preventDefault();
    }

    //跳转八斗类型交易详情
    goBDdeal(index) {
        this.navCtrl.push('DealPage', {
            logId: this.BDCdataList[index].logId,
            status: this.BDCdataList[index].status
        })
    }

    /** 上拉加载数据
     */

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');

        setTimeout(() => {
            switch (this.CurrencyType) {
                case "ETH":
                    this.addPages++;
                    this.renderETH(this.addPages);
                    break;
                case "ERC":
                    this.addPages++;
                    this.renderERC(this.addPages);
                    break;
                case "BTC":
                    this.before = this.comfireList[this.comfireList.length - 1].block_height
                    this.renderBit(this.before)
                    break;
                case "BdcTrans":
                    this.BDCPages++;
                    this.renderBDC(this.BDCPages)
                    break;

                default:
                    // code...
                    break;
            }
            infiniteScroll.complete();
        }, 2000);
    }

}
