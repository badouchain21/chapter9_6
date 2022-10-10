import { Component } from '@angular/core';

import { HomePage } from '../home/home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
	tabRoots: Object[];

  constructor() {
  	this.tabRoots = [ { root: 'CollectPage', tabTitle: '首页', tabIcon: 'ios-ionic' },
                      { root: HomePage, tabTitle: '资产', tabIcon: 'ios-body' },
  										{ root: 'ClaimPage',tabTitle: '应用', tabIcon:'ios-apps-outline'},
                      { root: 'UserPage', tabTitle: '我的', tabIcon: 'ios-color-palette' },
                     ];

  }

  ionViewWillEnter(){
  	
  }
}
