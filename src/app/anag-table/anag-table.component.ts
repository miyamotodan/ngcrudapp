import { Component, OnInit } from '@angular/core';
import { RestclService } from '../rest/restcl.service';
import { DialogService } from '../dialog/dialog.service';
import { FormGroup } from '@angular/forms'
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'
import { ConfigLoaderService } from '../config/appconfig.service';

import { toArray, OP_DELETE, OP_INSERT, OP_UPDATE } from '../util/util.module';

export interface IAnagTable {
  id: number,
  table_name: string
}

@Component({
  selector: 'app-home',
  templateUrl: './anag-table.component.html',
  styleUrls: ['./anag-table.component.css']
})
export class AnagTableComponent implements OnInit {

  public resultSet: IAnagTable[] = [];
  public formActive = false;
  public operation = "";
  public alerts: any[] = [{ type: 'info', message: 'i messaggi compaiono qui, chiudere prego' }];

  public restURL:string;

  //schema dati della tabella utenti

  form = new FormGroup({});
  public jsonFormData = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  fields: FormlyFieldConfig[] = [
    {
      key: 'id',
      type: 'input',
      defaultValue: '0',
      templateOptions: {
        label: 'id',
        type: 'string',
        required: true,
        description: 'id univoco'
      }
    },
    {
      key: 'name',
      type: 'input',
      templateOptions: {
        label: 'Name',
        placeholder: 'es:daniele',
        required: false,
        description: 'Nome utente',
      },
      validators: {
        name: {
          expression: (fc) => {
            if (fc.value.length<4)
              return false;
            else
              return true;
          },
          message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" troppo corto`,
        }
      }
    },
    {
      key: 'surname',
      type: 'input',
      templateOptions: {
        label: 'Surname',
        placeholder: 'es:del pinto',
        required: false,
        description: 'Cognome utente',
      }
    },
    {
      key: 'age',
      type: 'input',
      templateOptions: {
        label: 'Età',
        placeholder: 'es:12',
        required: false,
        description: 'Età utente',
      }
    },
    {
      key: 'nick',
      type: 'input',
      templateOptions: {
        label: 'Nickname',
        placeholder: 'es:miya',
        required: false,
        description: 'Soprannome utente',
      }
    },
    {
      key: 'email',
      type: 'input',
      templateOptions: {
        label: 'mail',
        placeholder: 'es:miya@mail.com',
        required: true,
        description: 'Mail utente',
      }
    }
  ];

  constructor(private restcl: RestclService, private dialogService: DialogService, private configLoaderService: ConfigLoaderService) {

    this.restURL = this.configLoaderService.apiBaseUrl+"/users/";

  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.restcl.readReq(this.restURL, "").subscribe((result) => {
      this.resultSet = toArray(JSON.parse(result.responseText));
      this.refreshList();
      console.log(this.restURL);
      console.log(this.resultSet);
    });
  }

  onSubmitForm(event, operation): void {
    if (this.form.valid) {
      console.log('submit ' + operation, this.jsonFormData, event);
      switch (operation) {
        case OP_UPDATE:
          this.executeUpdate(this.jsonFormData);
          break;
        case OP_DELETE:
          this.executeDelete(this.jsonFormData);
          break;
        case OP_INSERT:
          this.executeInsert(this.jsonFormData);
          break;
        default:
          break;
      }
    } 
  }

  onDetailForm(id) {
    if (!this.formActive) {
      this.formActive = true;
      this.jsonFormData = JSON.parse(JSON.stringify( this.resultSet.find(e => e.id === id) ));
      this.operation = OP_UPDATE;
      //this.fields[1].templateOptions.readonly = false; //table_name
      console.log("detail: " + id);
    }
  }

  onDeleteForm(id) {
    if (!this.formActive) {
      this.formActive = true;
      this.jsonFormData = JSON.parse(JSON.stringify( this.resultSet.find(e => e.id === id) ));
      this.operation = OP_DELETE;
      //this.fields[1].templateOptions.readonly = true; //table_name
      console.log("delete:" + id);
    }
  }

  onInsertForm() {
    if (!this.formActive) {
      this.formActive = true;
      this.jsonFormData = {};
      this.jsonFormData = {id: "0", email: "", name: "", surname: "", nick: ""};
      this.operation = OP_INSERT;
      //this.fields[1].templateOptions.readonly = false; 
      console.log("insert");
    }
  }

  onBackDetailForm() {
    this.formActive = false;
    console.log("back");
  }

  onCloseAlert(alert: any) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  executeInsert(event: any) {
    this.dialogService.confirm('Conferma operazione', 'Sei sicuro di voler inserire il record?')
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per creare il record
          console.log( JSON.stringify(event));
          this.restcl.createReq(this.restURL, JSON.stringify(event)).subscribe(
            (result) => {
              console.log('next from createReq');
              this.alerts.push({ type: 'success', message: 'Inserimento effettuato' });
              this.loadData();
              this.formActive = false;
            },
            (err) => {
              console.log('error from createReq');
              this.alerts.push({ type: 'warning', message: 'Inserimento NON riuscito: '+JSON.parse(err.response).error.message });
              console.log(err)
            },
            () => {
              console.log('complete from createReq');

            }
          );
        }
      })
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  executeUpdate(event: any) {
    this.dialogService.confirm('Conferma operazione', 'Sei sicuro di voler modificare il record?')
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per modificare il record
          this.restcl.updateReq(this.restURL + event.id, JSON.stringify(event)).subscribe(
            (result) => {
              console.log('next from updateReq');
              this.alerts.push({ type: 'success', message: 'Modifica effettuata' });
              this.loadData();
              this.formActive = false;
            },
            (err) => {
              console.log('error from updateReq');
              this.alerts.push({ type: 'warning', message: 'Modifica NON riuscita: '+JSON.parse(err.response).error.message  });
            },
            () => {
              console.log('complete from updateReq');

            }
          );
        }
      })
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  executeDelete(event: any) {
    this.dialogService.confirm('Conferma operazione', 'Sei sicuro di voler eleiminare il record?')
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per eliminare il record
          this.restcl.deleteReq(this.restURL + event.id, JSON.stringify(event)).subscribe(
            (result) => {
              console.log('next from deleteReq');
              this.alerts.push({ type: 'success', message: 'Cancellazione effettuata' });
              this.loadData();
              this.formActive = false;
            },
            (err) => {
              console.log('error from deleteReq');
              this.alerts.push({ type: 'warning', message: 'Cancellazione NON riuscita: '+JSON.parse(err.response).error.message });
            },
            () => {
              console.log('complete from deleteReq');

            }
          );
        }
      })
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  
  //-------- PAGINAZIONE -------
  page = 1;
  pageSize = 10;
  p_start = 0;
  p_end = 0;

  refreshList() {
    this.p_start = (this.page-1)*this.pageSize;
    this.p_end = (this.page - 1) * this.pageSize + this.pageSize;
  }
  //-------- PAGINAZIONE -------
  

}