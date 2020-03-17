import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { FormBuilder, Validators } from "@angular/forms";


@Injectable()

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: HttpClient, public fb: FormBuilder) { }
  // apiURL : string = "https://dwn-backend.cfapps.eu10.hana.ondemand.com/";
  apiURL: string = "http://localhost:3000/";
  isSubmitted = false;

  public Extn: any = ['xls', 'xlsx', 'pdf', 'doc', 'ppt']

  /*########### Form ###########*/
  downloadForm = this.fb.group({
    extnName: ['', [Validators.required]]
  })

  changeExtn(e) {
    console.log(e.value)
    this.extnName.setValue(e.target.value, {
      onlySelf: true
    })
  }

  // Getter method to access formcontrols
  get extnName() {
    return this.downloadForm.get('extnName');
  }

  /*########### Template Driven Form ###########*/
  onSubmit() {
    this.isSubmitted = true;
    if (!this.downloadForm.valid) {
      return false;
    } else {
      console.log(this.downloadForm.value)
      this.download(this.downloadForm.value)
    }

  }

  /**Download function here */
  download(value) {
    this.get('?extn=' + value.extnName, { responseType: 'blob' }).subscribe((data: any) => {
      const serviceData = {
        downloadData: data,
        extension: value.extnName,
        fileName: 'sample'
      }

      const url = window.URL.createObjectURL(new Blob([serviceData.downloadData]));
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = `${serviceData.fileName}.${serviceData.extension}`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove(); // remove the element


    });
  }

  get(url: string, params?: any, header?: any) {
    /**
     * http get method
     * @param url - url for http request
     * @param params it construct the url with given params
     */
    return this.http.get<any>(this.apiURL.concat(url), params)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Error handling - NEED TO USE THE ERRORHANDLINGSERVICE
  private handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  title = 'download-service';
}
