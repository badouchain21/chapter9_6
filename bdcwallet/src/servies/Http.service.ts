import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Headers, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { NativeService } from "./Native.service";

/**
 * http请求
 * @description
 */
@Injectable()
export class HttpService {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    myInfoLocal: any;
    local: Storage;
    activeUser;

    constructor(private http: Http,
                private nativeSer: NativeService) {
      this.activeUser = this.nativeSer.getObject('activeUser');
    }
    /** get 请求
     */
    public get(url:string, params?:any, callback?: Function){
      console.log('get--url--'+url);
      console.log('url + params==='+ (url + params));
      return this.http.get(url + this.toQueryString(params))
          .toPromise()
          .then(res => callback(res.json()))
          .catch(error => this.handleError(error));
    }

    /** post 请求
     */
    public post(url: string, params?: any, callback?: Function, hideLoad?:boolean) {
      let postLoading = null;
      if(!hideLoad){
        
      }
      // console.log('post--params---'+JSON.stringify(params));

      let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
      
      return this.http.post(url, this.toBodyString(params), new RequestOptions({headers: headers}))
        .toPromise()
        .then(res => {
          console.log('post-res--'+ JSON.stringify(res));

          this.handleSuccess(res.json(),callback);
          if(postLoading){
            postLoading.dismiss();
          }
        })
        .catch(error => {
          console.log(error)
           this.handleError(error,callback);
           if(postLoading){
             postLoading.dismiss();
           }
        });
    }
    /** post 请求
     */
    public postFile(url: string, params?: any, callback?: Function, hideLoad?:boolean) {
      console.log('==============='+ params)
      let postLoading = null;
      if(!hideLoad){
       
      }

      let headers = new Headers({'Content-Type':undefined});
      
      return this.http.post(url, params, new RequestOptions({headers:headers}))
        .toPromise()
        .then(res => {
          console.log('post-res--'+ JSON.stringify(res));

          this.handleSuccess(res.json(),callback);
          if(postLoading){
            postLoading.dismiss();
          }
        })
        .catch(error => {
          this.handleError(error,callback);
          if(postLoading){
            postLoading.dismiss();
          }
        });
    }
    /** postUncode 请求(param不编码)
     */
    public postUncode(url, params, callback?: Function, hideLoad?:boolean){
      let postLoading = null;
      if(!hideLoad){
        
      }
      console.log('======params==='+ JSON.stringify(params));
      console.log('activeUser-----'+JSON.stringify(this.activeUser));
      let p = new URLSearchParams();
          p.append('data', JSON.stringify(params));
          p.append('token', this.activeUser.token);
          p.append('userId', this.activeUser.userId);
      let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
      return this.http.post(url, p, new RequestOptions({headers: headers}))
        .toPromise()
        .then(res => {
          this.handleSuccess(res.json(),callback);
          if(postLoading){
            postLoading.dismiss();
          }
          //console.log('post-res--'+ JSON.stringify(res.json()));
        })
        .catch(error => {
          this.handleError(error,callback);
          if(postLoading){
            postLoading.dismiss();
          }
        });
    }

    /** 请求成功操作
     */
    private handleSuccess(res,callback:Function){
      if(res){
        callback(true, res);
      }else{
        callback(false,res);
      }
    }
    /** 请求失败操作
     */
    private handleError(error: Response | any, callback?:Function) {
      console.log('handleError=-='+error); 

      // let msg = '请求失败',
       let msg = '',
          posit = 'bottom';
      if (error.status == 0) {
        msg = '请求地址错误';
      }
      if (error.status == 400) {
        msg = '请求无效';
        console.log('请检查参数类型是否匹配');
      }
      if (error.status == 403) {
        msg = 'token已过期,请重新登录';
        posit = 'middle';
      }
      if (error.status == 404) {
        msg = '请求资源不存在';
        console.error(msg+'，请检查路径是否正确');
      }
      if (error.status == 500) {  
        msg += '，请求的服务器错误';
        console.error('请求的服务器错误');  
      }   
      
      callback(false, error);
      //return {success: false, res: error}; 
   　}

   /**
    * @param obj　参数对象
    * @return {string}　参数字符串
    * @example
    *  调用: toQueryString(obj);
    */
   private toQueryString(obj) {
     let ret = [];
     for (let key in obj) {
       key = encodeURIComponent(key);
       let values = obj[key];
       if (values && values.constructor == Array) {//数组
         let queryValues = [];
         for (let i = 0, len = values.length, value; i < len; i++) {
           value = values[i];
           queryValues.push(this.toQueryPair(key, value));
         }
         ret = ret.concat(queryValues);
       } else { //字符串
         ret.push(this.toQueryPair(key, values));
       }
    }
     return '?' + ret.join('&');
   }

   /**
    * @param obj
    * @return {string}
    *  调用: toQueryPair(obj);
    */
   public toBodyString(obj) {
      let ret = [];
      for (let key in obj) {
        key = encodeURIComponent(key);
        let values = obj[key];
        if (values && values.constructor == Array) {//数组
          let queryValues = [];
          for (let i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(this.toQueryPair(key, value));
          }
          ret = ret.concat(queryValues);
        } else { //字符串
          ret.push(this.toQueryPair(key, values));
        }
      }
      // console.log("ret.join('&')==="+JSON.stringify(ret.join('&')));
      return ret.join('&');
    }

    private toQueryPair(key, value) {
     if (typeof value == 'undefined') {
       return key;
     }
     return key + '=' + encodeURIComponent(value === null ? '' : String(value));
   } 
}