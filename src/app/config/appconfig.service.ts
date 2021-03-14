import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { AppConfig } from './config.model';

@Injectable()
export class ConfigLoaderService {

  public appTitle: string;
  public apiBaseUrl: string;

  constructor(private httpClient: HttpClient) { }

  initialize() {
    return this.httpClient.get<AppConfig>('./assets/config.json')
      .pipe(tap((response: AppConfig) => {
        this.appTitle = response.title;
        this.apiBaseUrl = response.apiBaseUrl;
      })).toPromise<AppConfig>();
  }

}