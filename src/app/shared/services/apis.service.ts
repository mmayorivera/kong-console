import { Service } from './service';
import { Observable } from 'rxjs/Observable';
import { has, get, clone, omit } from 'lodash';
import { Configurator } from '../core/configurator';
import { Injectable, Injector } from '@angular/core';
import { SYMBOLS, getLocalStorage } from '../constants';
import { ApisModel, ApisModelResource } from '../models/apis.model';
import { RestAdapter, ResourceResponse } from '../adapters/rest.adapter';
import { Headers, RequestOptions, URLSearchParams } from '@angular/http';

export interface ApiGetParameters {
  id?: string;
  name?: string;
  request_host?: string;
  request_path?: string;
  upstream_url?: string;
  size?: string;
  offset?: string;
}

@Injectable()
export class ApisService extends Service<RestAdapter> {
  constructor(inject: Injector, private _configurator: Configurator) {
    super(inject);
  }

  apis(args?: ApiGetParameters): Observable<ApisModel> {
    let baseUrl: string = this._configurator.getOption('API.URL');
    let reqOptions = this._reqOptions();

    let params: URLSearchParams = new URLSearchParams();
    /* tslint:disable */
    has(args, 'size') ? params.set('size', get(args, 'size', '10')) : params.set('size', '10');
    has(args, 'name') ? params.set('name', get(args, 'name', '')) : undefined;
    has(args, 'request_host') ? params.set('request_host', get(args, 'request_host', '')) : undefined;
    has(args, 'request_path') ? params.set('request_path', get(args, 'request_path', '')) : undefined;
    has(args, 'upstream_url') ? params.set('upstream_url', get(args, 'upstream_url', '')) : undefined;
    has(args, 'offset') ? params.set('offset', get(args, 'offset', '')) : undefined;
    /* tslint:enable */
    reqOptions.search = params;

    return this.adapter.get(`${baseUrl}/apis`, reqOptions)
      .flatMap((list) => {
        return Observable.of(new ApisModel(list.data));
      });
  }

  get(id: string): Observable<ApisModel> {
    let baseUrl: string = this._configurator.getOption('API.URL');
    let reqOptions = this._reqOptions();

    return this.adapter.get(`${baseUrl}/apis/${id}`, reqOptions)
      .flatMap((rs) => {
        return Observable.of(new ApisModel(rs.data));
      });
  }

  add(model: ApisModel): Observable<ResourceResponse<ApisModelResource>> {
    let baseUrl: string = this._configurator.getOption('API.URL');
    let reqOptions = this._reqOptions();
    // TODO: omit _subject and collection property
    let params = this._cleanModel(model);

    return this.adapter.post(`${baseUrl}/apis`, params, reqOptions);
  }

  update(model: ApisModel): Observable<ResourceResponse<ApisModelResource>> {
    let baseUrl: string = this._configurator.getOption('API.URL');
    let reqOptions = this._reqOptions();
    // TODO: omit _subject and collection property
    let params = this._cleanModel(model);

    return this.adapter.patch(`${baseUrl}/apis/${model.id}`, params, reqOptions);
  }

  private _reqOptions(): RequestOptions {
    let localData: {key: string, user: string} = JSON.parse(getLocalStorage(SYMBOLS.USER));

    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + localData.key);
    return new RequestOptions({ headers: headers, withCredentials: false });
  }

  private _cleanModel(model: ApisModel) {
    return omit(clone(model), [
      '_subject', 'collection', '_setCollection', 'getAttribute', 'hasAttribute',
      'observe', 'removeAttribute', 'setAttribute'
    ]);
  }
}
