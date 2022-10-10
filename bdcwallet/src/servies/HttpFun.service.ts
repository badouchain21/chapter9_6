import { Injectable } from '@angular/core';

/**
 * http请求
 * @description
 */
 @Injectable()
export class HttpFunService {

	constructor() {
    }


  /*
    @将传递的参数进行字符串转化
  */
  toBodyString(obj) {
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

  toQueryPair(key, value) {
    if (typeof value == 'undefined') {
       return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
  } 
}