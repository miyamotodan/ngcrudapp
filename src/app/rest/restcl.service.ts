import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestclService {

  constructor(private http: HttpClient) { }

  private makeReq(url: string, formData: string, method: string): Observable<XMLHttpRequest> {
    return new Observable(function (observer) {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            observer.next(xhr);
          } else {
            observer.error(xhr);
          }
        }
      };

      /*
      console.log("|--------HTTP-------");
      console.log("| method", method);
      console.log("| url", url);
      console.log("| formData", formData);
      console.log("--------------------");
      */

      xhr.open(method, url);
      //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(formData);
    });
  }

  readReq(url: string, formData: string): Observable<XMLHttpRequest> {
    return this.makeReq(url, formData, "GET");
  }

  createReq(url: string, formData: string): Observable<XMLHttpRequest> {
    return this.makeReq(url, formData, "POST");
  }

  updateReq(url: string, formData: string): Observable<XMLHttpRequest> {
    return this.makeReq(url, formData, "PUT");
  }

  deleteReq(url: string, formData: string): Observable<XMLHttpRequest> {
    return this.makeReq(url, formData, "DELETE");
  }



}
