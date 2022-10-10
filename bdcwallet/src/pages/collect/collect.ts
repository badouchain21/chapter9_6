import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { NativeService } from '../../servies/Native.service';
import { HttpService } from '../../servies/Http.service';


@IonicPage()
@Component({
  selector: 'page-collect',
  templateUrl: 'collect.html',
})
export class CollectPage {
	balllist:any=[] //积分球数据列表
  ballLength:any=[]; //收集索引
  heightNum:any=[]; //高度数组 
  widthNum:any=[];  //宽度数组
  walletObject:any; //本地钱包数据
  walletIndex:any; //当前钱包索引
  integral:any; //积分值
  force:any; //原力值
  logIdList:any=[]; //积分id列表
  isFinished:boolean=false; //控制是否收取完毕
  renderNum:any; //积分球渲染个数
  ballCount:any=0; //积分球收取计数
  ballNum:any; //积分球总个数
  datalist:any=[]; //积分球请求返回数据
  testHTTP:string="http://192.168.1.221:9999/center";
  formalHTTP:string="http://www.badouchain.com/center";

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
    private http: Http,
    public navService:NativeService,
    public navHttpfun:HttpService,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectPage');
  }

  ionViewWillLeave(){
    this.balllist=null
    this.integral=0
    this.navService.setObject('walletObject',this.walletObject)
  }

  ionViewWillEnter(){
    //防止使用tabHide方法后底部tab隐藏
    this.navService.tabShow()
  }

  ionViewDidEnter(){
     setTimeout(()=>{
       this.getIntegral()
     },10)
  }

  //获取积分信息
  getIntegral(){
    this.walletObject=this.navService.get('walletSql')
    this.walletIndex=this.navService.get('walletIndex')
    console.log(this.walletIndex)

    this.integral=this.walletObject[this.walletIndex].integral
    this.force=this.walletObject[this.walletIndex].force

    if(this.walletObject[this.walletIndex].BDCaddress){
      this.isFinished=false;
      this.balllist=[]
      

      /*生产环境 or 测试环境*/
      var integralURL=this.formalHTTP+"/restapi/wallet/listIntegralToGain?address="+this.walletObject[this.walletIndex].BDCaddress

      //获取积分球个数和积分
      this.http.request(integralURL).subscribe((res:Response)=>{
        this.datalist=res.json()
        console.log(this.datalist)
        if(this.datalist.return_code==="SUCCESS"){
          this.logIdList=Object.keys(this.datalist.return_data)
          if(this.logIdList.length===0){
            this.isFinished=true;
          }
          // for(var i=0;i<Object.keys(datalist.return_data).length;i++){
          //   this.balllist.push({number:"",style:""})
          //   this.balllist[i].number=datalist.return_data[this.logIdList[i]]
          // }
          
          this.ballLength=Object.keys(this.datalist.return_data).length
          this.ballNum=this.ballLength

          // var size = {w: document.body.clientWidth, h: document.body.clientHeight}
          // var radius = 30
          // let pointArr = []
          if(this.ballLength>10){
            this.renderNum=10
          }else{
            this.renderNum=this.ballLength
          }

          this.addBall(0,this.renderNum)

        }else{
          this.isFinished=true;
        }
      },(error:Response)=>{

      })
    }else{
      this.isFinished=true;
    }
  }


  //点击收集效果
  collected(index){
    this.ballLength--;
    this.ballCount++;

  	this.balllist[index].style={
  		'-webkit-transition': 'all .8s ease-in',
        '-moz-transition': 'all .8s ease-in',
        transition: 'all .8s ease-in',
        opacity: '0',
        'animation': 'disappear .8s linear infinite',
        'position':'absolute',
        'top':this.heightNum[index],
        'left':this.widthNum[index],
  	}
    this.integral=(parseFloat(this.integral)+parseFloat(this.balllist[index].number)).toFixed(2)
    this.walletObject[this.walletIndex].integral=this.integral
    this.navService.set('walletSql',this.walletObject)

    var receiveURL=this.formalHTTP+"/restapi/wallet/gainIntegral" /*生产环境 or 测试环境*/
    
    var params={
      "integralLogId":this.logIdList[index],
      "reason":null
    }
    //设置请求头,使参数以表单形式传递
    let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})

    //领取积分
    this.http.post(receiveURL,this.navHttpfun.toBodyString(params),new RequestOptions({headers: headers})).subscribe((res:Response)=>{
       console.log(res.json())
    })

    
    if(this.ballLength===0){ //当积分球被全部收集
      this.isFinished=true;
    }else{
      if(this.ballCount===10){
        this.balllist=[] //清空积分球数组
        this.heightNum=[]
        this.widthNum=[]
        var InitValue; //i的初始值
        console.log(this.ballLength)

        if(this.ballLength>10){ //计算当前渲染积分球个数 当前剩余大于10个,则渲染十个,否则将剩余渲染
          this.renderNum=this.renderNum+10
          InitValue=this.renderNum-10
        }else{ 
          this.renderNum=this.renderNum+this.ballLength
          InitValue=this.renderNum-this.ballLength
        }
        
        this.addBall(InitValue,this.renderNum)
         
        this.ballCount=0
      }
    }
    
  }


  //渲染积分球
  addBall(InitValue,renderNum){
  	var size = {w: document.body.clientWidth, h: document.body.clientHeight}
    var radius = 30
    let pointArr = []
    var j=-1 //balllist数组下标
    var n=-1 //balllist数组下标

    for(var i=InitValue;i<this.renderNum;i++){
      j++
      this.balllist.push({number:"",style:""})
      this.balllist[j].number=this.datalist.return_data[this.logIdList[i]]
    }

    for(var i=InitValue;i<renderNum;i++){
      let newPoint = this.randomPoint(size)
      if (this.testAvailable(pointArr, newPoint, radius)) {
        n++
        pointArr.push(newPoint)
        var height=newPoint.y
        var width=newPoint.x

        var heightStr=height+"px"
        var widthStr=width+"px"

        this.heightNum[n]=heightStr.toString()
        this.widthNum[n]=widthStr.toString()
        this.balllist[n].style={
                      'position':'absolute',
                      'top':heightStr.toString(),
                      'left':widthStr.toString()
                  }

      }else{
        i--
      }
    }
  }

  // 生成随机点
  randomPoint ({w, h}) {
    w=parseInt(w)
    h=parseInt(h)
    var x = (Math.random()*(w-50)+1).toFixed(0)
    var y = (Math.random()*(h-(h*0.3))+50).toFixed(0)
    return {x, y}
  }

  // 判断两个区域是否重叠
  testOverlay (pointA, pointB, radius) {
    const x = Math.abs(pointA.x - pointB.x)
    const y = Math.abs(pointA.y - pointB.y)
    const distance = Math.sqrt((x * x) + (y * y))
    if (distance >= radius * 2) {
      return false
    } else {
      return true
    }
  }

  // 判断新生成的点是否有效
  testAvailable (pointArr, newPoint, radius) {
    let arr = Array.from(pointArr)
    let aval = true
    while(arr.length > 0) {
      let lastPoint = arr.pop()
      if (this.testOverlay(lastPoint, newPoint, radius)) {
        aval = false
        break;
      }
    }
    return aval
  }

}
