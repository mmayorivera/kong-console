import { Component, OnInit, OnDestroy } from '@angular/core';

import { find, includes } from 'lodash';

import { Container } from '../../../core';
import {
  SYMBOLS, PluginsService, StatusService, PLUGINSDATA
} from '../../../shared';

@Component({
  moduleId: __filename,
  selector: 'plugins-page',
  templateUrl: './plugins.template.html',
  providers: [ PluginsService, StatusService ]
})
export class PluginsContainer extends Container implements OnInit, OnDestroy {

  available: Array<any> = [];

  constructor(
    private plugService: PluginsService,
    private statusService: StatusService
  ) {
    super();
  }

  ngOnInit() {
    this.subscriptions = this.statusService.kong()
      .subscribe((kongModel) => {
        let available = kongModel.plugins.available_on_server;
        let active = kongModel.plugins.enabled_in_cluster;

        this.available = available.map((value) => {
          let data = find(PLUGINSDATA, { id: value });

          return {
            id: value,
            data: data ? data : { id: value, title: 'Custom Plugin', info: 'Custom plugin.'},
            active: includes(active, value)
          };
        });
      });
  }

  ngOnDestroy() {
    this.clean();
  }
}