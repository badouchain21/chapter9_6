/**
 * 各种常用变量
 * @description
 */

//export const APP_SERVER_ETH ='https://api-ropsten.etherscan.io'; //ETH测试环境
export const APP_SERVER_ETH = 'https://api.etherscan.io'; //ETH正式环境


//export const APP_SERVER_ETH_NODE= 'https://ropsten.infura.io/a57666ee616d4c71a228532e2efb3a94'; //ETH节点测试环境
export const APP_SERVER_ETH_NODE = 'https://mainnet.infura.io/a57666ee616d4c71a228532e2efb3a94'; //ETH节点正式环境

export const headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'})

/**
 *本地环境
 */
// export const UNION_URL = 'http://192.168.2.106:8084/bd-blockchain-union';
// export const APP_SERVER_BDC = 'http://192.168.2.107:9090/blockchain-center';
/*
 *测试环境
 */
//export const UNION_URL = 'http://192.168.1.221:9999/union';
// export const APP_SERVER_BDC = 'http://192.168.1.221:9999/center';

/**
 *正式环境
 *
 */
export const APP_SERVER_BDC = 'http://www.badouchain.com/center';
export const UNION_URL = 'http://www.badouchain.com/union';
// 支持上传的图片格式
export const mime= {'png': 'image/png', 'jpg': 'image/jpeg'};


