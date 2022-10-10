import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ToastController } from 'ionic-angular';
import { NativeService } from '../../../servies/Native.service';
import { Response, } from '@angular/http';


@IonicPage()
@Component({
  selector: 'page-ipfs-vedio',
  templateUrl: 'ipfs-vedio.html',
})
export class IpfsVedioPage {

 title:string="IPFS"; //标题
	isBDC:boolean=false; //判断当前钱包是否属于八斗类型  
	walletObject:any; //本地钱包数据
	walletIndex:any;  //当前钱包索引
	scannedCode = null; //扫描二维码得到的数据
	applist:any; //应用列表
	loading:any; //加载效果
  maxFileSize:number=10000000; // 上传文件大小
  uploadIsShow:boolean=true; // 判断上传框是否展示
  videoIsShow:boolean=false; // 判断是否展示视频播放
  ipfsUrl:any="http://47.104.241.139:7196/ipfs/"; // ipfs的地址
  searchContent:any=""; // 搜索框内容
  videoUrl:any; // 视频播放地址
  unUploadIsShow:boolean=true; // 显示可以上传视频
  uploadingIsShow:boolean=false; // 显示上传视频中
  isLoad:boolean=false; // loading效果是否显示

  constructor(
  	public navCtrl: NavController,
  	public navParams: NavParams,
  	public navService:NativeService,
  	public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,) {
  }

  ionViewDidEnter() {
    //解决使用了navCtrl.setRoot后进入页面出现底部tabs的bug
    this.navService.tabHide()
  }


  // 显示视频播放
  videoShow() {
    this.uploadIsShow = false;
    setTimeout(()=>{
      this.isLoad=false
      this.videoIsShow = true;
    },1000)
  }

  // 显示上传框
  uploadShow() {
      this.isLoad=false
      this.uploadIsShow = true;
      this.videoIsShow = false;
  }

  // 显示可以上传视频
  unUploadShow(event) {
    this.unUploadIsShow=true; 
    this.uploadingIsShow=false;
    // 清空上传内容
    event.target.value="";
    // 移除搜索框不可编辑属性
    var searchbarInput = document.getElementsByClassName("searchbar-input")[0];
    searchbarInput.removeAttribute('disabled');
  }

  // 显示上传视频中
  uploadingShow() {
    this.unUploadIsShow=false; 
    this.uploadingIsShow=true;
    // 搜索框不可编辑
    var searchbarInput = document.getElementsByClassName("searchbar-input")[0];
    searchbarInput.setAttribute('disabled', 'true');
  }

  // 播放
  play(hash) {
    this.isLoad=true
    if (hash && hash.trim()) {
      this.searchContent = hash.trim();
      this.videoUrl = this.ipfsUrl + this.searchContent;
      this.videoShow();
    } else {
      this.uploadShow();
    }
  }

  // 搜索
  search(ev) {
    var hash = ev.target.value;
    this.play(hash);
  }

  // 上传
  upload(event) {
    this.uploadingShow();
    const ipfsApi = require('ipfs-api')
    const fileReaderPullStream = require('pull-file-reader')
    const ipfs = ipfsApi('47.104.241.139', '7412');
    const file = event.target.files[0];
    var fileSize = file.size;
    if (fileSize > this.maxFileSize) {
      var str="上传视频不得超过10M"
      this.navService.presentToast(str)
      this.unUploadShow(event);
      return;
    }
    let ipfsId;
    const fileStream = fileReaderPullStream(file);
    //ipfs.add(fileStream, { progress: (prog) => console.log(`进度: ${parseInt(prog/fileSize*100)}%`) })
    ipfs.add(fileStream).then((response) => {
        ipfsId = response[0].hash
        this.searchContent = ipfsId
        this.play(this.searchContent);
        this.unUploadShow(event);
      }).catch((err) => {
        console.error(err)
        this.unUploadShow(event);
      })
  }


  // 打开上传框
  openUpload() {
    var uploadBox = document.getElementsByClassName("uploadBox")[0];
    var evt = new MouseEvent("click", {
        bubbles: false,
        cancelable: true,
        view: window
    });
    uploadBox.dispatchEvent(evt);
  }
}
