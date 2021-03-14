import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnagTableComponent } from './anag-table/anag-table.component';
import { AboutComponent } from './about/about.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxJsonViewModule } from 'ng-json-view';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogComponent } from './dialog/dialog.component';
import { AlertComponent } from './alert/alert.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AnagSchemaComponent } from './anag-schema/anag-schema.component';
import { HomeComponent } from './home/home.component';
import { MetadataComponent } from './metadata/metadata.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { TestComponent } from './test/test.component';
import { ArrayTypeComponent } from './util/array.type';
import { ObjectTypeComponent } from './util/object.type';
import { MultiSchemaTypeComponent } from './util/multischema.type';
import { NullTypeComponent } from './util/null.type';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { SortDirective } from './util/sort.directive';
import {FormlyTabsModule} from 'ngx-formly-tabs';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { FileSaverModule } from 'ngx-filesaver';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { PreloadFactory } from "./config/preload-service.factory";
import { ConfigLoaderService } from './config/appconfig.service';
import { MetadataInstanceComponent } from './metadata-instance/metadata-instance.component';

export function minItemsValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT have fewer than ${field.templateOptions.minItems} items`;
}

export function maxItemsValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT have more than ${field.templateOptions.maxItems} items`;
}

export function minlengthValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT be shorter than ${field.templateOptions.minLength} characters`;
}

export function maxlengthValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT be longer than ${field.templateOptions.maxLength} characters`;
}

export function minValidationMessage(err, field: FormlyFieldConfig) {
  return `should be >= ${field.templateOptions.min}`;
}

export function maxValidationMessage(err, field: FormlyFieldConfig) {
  return `should be <= ${field.templateOptions.max}`;
}

export function multipleOfValidationMessage(err, field: FormlyFieldConfig) {
  return `should be multiple of ${field.templateOptions.step}`;
}

export function exclusiveMinimumValidationMessage(err, field: FormlyFieldConfig) {
  return `should be > ${field.templateOptions.step}`;
}

export function exclusiveMaximumValidationMessage(err, field: FormlyFieldConfig) {
  return `should be < ${field.templateOptions.step}`;
}

export function constValidationMessage(err, field: FormlyFieldConfig) {
  return `should be equal to constant "${field.templateOptions.const}"`;
}

@NgModule({
  declarations: [
    AppComponent,
    AnagTableComponent,
    AboutComponent,
    DialogComponent,
    AlertComponent,
    AnagSchemaComponent,
    HomeComponent,
    MetadataComponent,
    TestComponent,
    ArrayTypeComponent,
    ObjectTypeComponent,
    MultiSchemaTypeComponent,
    NullTypeComponent,
    SortDirective,
    MetadataInstanceComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxJsonViewModule,
    BrowserAnimationsModule,
    NgbModule,
    ReactiveFormsModule, FormsModule,
    FormlyTabsModule,
    NgJsonEditorModule,
    FileSaverModule ,
    NgxChartsModule,
    FormlyModule.forRoot({
      extras: { resetFieldOnHide: true, lazyRender: true },
      validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'null', message: 'should be null' },
        { name: 'minlength', message: minlengthValidationMessage },
        { name: 'maxlength', message: maxlengthValidationMessage },
        { name: 'min', message: minValidationMessage },
        { name: 'max', message: maxValidationMessage },
        { name: 'multipleOf', message: multipleOfValidationMessage },
        { name: 'exclusiveMinimum', message: exclusiveMinimumValidationMessage },
        { name: 'exclusiveMaximum', message: exclusiveMaximumValidationMessage },
        { name: 'minItems', message: minItemsValidationMessage },
        { name: 'maxItems', message: maxItemsValidationMessage },
        { name: 'uniqueItems', message: 'should NOT have duplicate items' },
        { name: 'const', message: constValidationMessage },
      ],
      types: [
        { name: 'string', extends: 'input' },
        {
          name: 'number',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number',
            },
          },
        },
        {
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number',
            },
          },
        },
        { name: 'boolean', extends: 'checkbox' },
        { name: 'enum', extends: 'select' },
        { name: 'null', component: NullTypeComponent, wrappers: ['form-field'] },
        { name: 'array', component: ArrayTypeComponent },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'multischema', component: MultiSchemaTypeComponent },
      ],
    }),
    FormlyBootstrapModule
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' },
  [
    ConfigLoaderService,
    {
      provide: APP_INITIALIZER,
      deps: [
        ConfigLoaderService
      ],
      multi: true,
      useFactory: PreloadFactory
    }
  ]
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
