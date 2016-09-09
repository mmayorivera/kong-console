import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { lowerCase, capitalize, find, includes } from 'lodash';

import { Container } from '../../../core';

import {
  SYMBOLS, PluginsService, StatusService, PLUGINSDATA
} from '../../../shared';

@Component({
  moduleId: __filename,
  selector: 'plugin-detail-page',
  templateUrl: './details.template.html',
  providers: [ PluginsService ]
})
export class PluginDetailContainer extends Container implements OnInit, OnDestroy {

  constructor(
    private activeRoute: ActivatedRoute,
    private plugService: PluginsService
  ) {
    super();
  }

  ngOnInit() {
    let id = this.activeRoute.snapshot.params['id'];

    this.subscriptions = this.plugService.schema(id)
      .subscribe((schema) => {
        console.log(schema);
      });
  }

  ngOnDestroy() {
    this.clean();
  }

}