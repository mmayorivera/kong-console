import { isEmpty, kebabCase } from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Alert, AlertModel } from '../../../components';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import {
  Container, ApisService, ApisModel,
  ApisModelResource, SYMBOLS
} from '../../../shared';

@Component({
  moduleId: __filename,
  selector: 'edit-api',
  templateUrl: './new.template.html',
  providers: [ApisService],
  directives: [Alert]
})
export class EditApiContainer extends Container implements OnInit, OnDestroy {

  apiForm: FormGroup;
  apiModel: ApisModel;
  alertModel: AlertModel;

  constructor(
    private _apiService: ApisService,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    public fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.apiModel = <ApisModel>{};

    let id = this._activeRoute.snapshot.params['id'];

    this.subscriptions = this._apiService.get(id)
      .subscribe((model) => {
        this.apiModel = model;

        this.apiForm.get('name').setValue(model.name);
        this.apiForm.get('requestHost').setValue(model.request_host);
        this.apiForm.get('requestPath').setValue(model.request_path);
        this.apiForm.get('stripRequestPath').setValue(model.strip_request_path || false);
        this.apiForm.get('preserveHost').setValue(model.preserve_host || false);
        this.apiForm.get('upstreamUrl').setValue(model.upstream_url);
      });

    this.apiForm = this.fb.group({
      name: new FormControl(),
      requestHost: new FormControl(),
      requestPath: new FormControl(),
      stripRequestPath: new FormControl(false),
      preserveHost: new FormControl(false),
      upstreamUrl: new FormControl('', Validators.required)
    });
  }

  ngOnDestroy() {
    this.clean();
  }

  save() {
    if (!this.apiForm.valid) {
      return false;
    }

    this._cleanModel();

    this._apiService.update(this.apiModel)
      .subscribe(
        (rs) => {
          if (rs.ok) {
            this._router.navigate([SYMBOLS.ROUTES.APIS.INDEX]);
          }
        },
        (error) => {
          this.alertModel = <AlertModel>{
            visible: true,
            autoHide: true,
            title: '<h4><i class="icon fa fa-ban">API Error!</i></h4>',
            info: `<p>Please check your form.</p>
            <p>Details from server:</p>
            <code>${error.text()}</code>`,
            close: true,
            classes: 'alert-danger'
          };
        }
      );

    return true;
  }

  cancel(event: MouseEvent) {
    event.preventDefault();

    this._router.navigate([SYMBOLS.ROUTES.APIS.INDEX]);
  }

  reset(event: MouseEvent) {
    event.preventDefault();

    this.apiForm.reset();
  }

  private _cleanModel() {
    let form = this.apiForm.value;

    if (isEmpty(form.name)) {
      this.apiModel.removeAttribute('name');
    } else {
      this.apiModel.setAttribute('name', kebabCase(form.name));
    }

    if (isEmpty(form.requestHost)) {
      this.apiModel.removeAttribute('request_host');
    } else {
      this.apiModel.setAttribute('request_host', form.requestHost);
    }

    if (isEmpty(form.requestPath)) {
      this.apiModel.removeAttribute('request_path');
    } else {
      this.apiModel.setAttribute('request_path', form.requestPath);
    }

    if (isEmpty(form.upstreamUrl)) {
      this.apiModel.removeAttribute('upstream_url');
    } else {
      this.apiModel.setAttribute('upstream_url', form.upstreamUrl);
    }

    this.apiModel.setAttribute('preserve_host', form.preserveHost || false);
    this.apiModel.setAttribute('strip_request_path', form.stripRequestPath || false);
  }

}
