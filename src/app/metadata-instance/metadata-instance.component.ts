import { Component, OnInit } from '@angular/core';
import { RestclService } from '../rest/restcl.service';
import { DialogService } from '../dialog/dialog.service';
import { IAnagTable } from '../anag-table/anag-table.component'
import { FormGroup } from '@angular/forms'
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { ConfigLoaderService } from '../config/appconfig.service';
import { ActivatedRoute } from '@angular/router';
import { Router, Event } from '@angular/router';
import { NavigationStart, NavigationError, NavigationEnd } from '@angular/router';

import { toArray, OP_UPDATE } from '../util/util.module';

export interface IMetadataInstance {
  id: number,
  name: string,
  json_form: string,

  partition: number,
  offset: number,
  topic: string,
  timestamp: string
}

@Component({
  selector: 'app-metadata-instance',
  templateUrl: './metadata-instance.component.html',
  styleUrls: ['./metadata-instance.component.css']
})
export class MetadataInstanceComponent implements OnInit {

  //result set per la query sull'anagrafica tabelle
  public resultSet_AT: IAnagTable[] = [];
  //result set per la tabella dei metadati
  public resultSet: any[] = [];
  //tabella scelta sull'anagrafica 
  public metadataTable: string;

  public formActive = false;
  public innerFormActive = false;
  public operation = "";
  public alerts: any[] = [{ type: 'info', message: 'i messaggi compaiono qui, chiudere prego' }];

  //url base i servizi sulle tabelle dei metadati
  private restURL_base: string;
  //url per i servizi sull'anagrafica delle tabelle
  private restURL_AT: string;
  //url che viene composta per la specifica tabella dei metadati
  private restURL: string;

  //schema dati della tabella selezionata (sono tutte uguali)
  form = new FormGroup({});
  public jsonFormData: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  fields: FormlyFieldConfig[] = [
    {
      "fieldGroupClassName": "row",
      "fieldGroup": [
        {
          key: 'id',
          type: 'input',
          defaultValue: 0,
          className: "col-1",
          templateOptions: {
            label: 'id',
            type: 'number',
            min: 0,
            required: true,
            readonly: true,
            description: 'id univoco'
          }
        },
        {
          key: 'name',
          type: 'input',
          className: "col-3",
          templateOptions: {
            label: 'Name',
            placeholder: 'es:my_data_name',
            required: true,
            description: 'Nome del dato'
          }
        },
        {
          key: 'json_form',
          type: 'input',
          className: "col-8",
          templateOptions: {
            label: 'Dati',
            required: true,
            readonly: true,
            description: 'json dei dati'    
          }
        }
      ]
    },
    {
      "fieldGroupClassName": "row",
      "fieldGroup": [
        {
          key: 'partition',
          className: "col-3",
          type: 'input',
          templateOptions: {
            label: 'Partition',
            placeholder: '',
            required: false,
            description: 'Partition KAFKA',
            type: 'number'
          }
        },
        {
          key: 'offset',
          className: "col-3",
          type: 'input',
          templateOptions: {
            label: 'Offset',
            placeholder: '',
            required: false,
            description: 'Offset Kafka',
            type: 'number'
          }
        },
        {
          key: 'topic',
          className: "col-3",
          type: 'input',
          templateOptions: {
            label: 'Topic',
            placeholder: '',
            required: false,
            description: 'Topic Kafka',
          }
        },
        {
          key: 'timestamp',
          className: "col-3",
          type: 'input',
          templateOptions: {
            label: 'Timestamp',
            placeholder: '',
            required: false,
            description: 'Timestamp Kafka',
          }
        }
      ]
    },
  ];

  innerForm = new FormGroup({});
  public innerJsonFormData: any = {};
  innerFields: FormlyFieldConfig[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private restcl: RestclService, private dialogService: DialogService, private formlyJsonschema: FormlyJsonschema, private configLoaderService: ConfigLoaderService) {

    this.restURL_base = this.configLoaderService.apiBaseUrl;
    this.restURL_AT = this.restURL_base + "/anag_table/";

    //Router subscriber
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        //do something on start activity
        //console.log(event);
      }

      if (event instanceof NavigationError) {
        // Handle error
        console.error(event.error);
      }

      if (event instanceof NavigationEnd) {
        //do something on end activity
        // console.log(event);
        console.log(`metadati mode: ${this.route.snapshot.queryParamMap.get('mode')}`);
        this.loadDataAnagTable(this.route.snapshot.queryParamMap.get('mode'));
        this.metadataTable = null;
      }
    });

  }

  ngOnInit(): void {

  }

  loadData(): void {
    this.restcl.readReq(this.restURL, "").subscribe((result) => {
      this.resultSet = toArray(JSON.parse(result.responseText));
      this.refreshList();
      console.log(this.restURL);
      console.log(this.resultSet);
    });
  }

  loadDataAnagTable(mode): void {
    let u = this.restURL_AT;
    if (mode == 'i')
      u += 'master/0';
    else
      u += 'master/1';
    this.restcl.readReq(u, "").subscribe((result) => {
      this.resultSet_AT = toArray(JSON.parse(result.responseText));
      console.log(u);
      console.log(this.resultSet_AT);
    });
  }

  setMetadataTable(table_name): void {
    this.metadataTable = table_name;
    this.restURL = this.restURL_base + "/" + table_name + "/";

    //carica i dati della tabella
    this.loadData();
  }

  onSubmitForm(event, operation): void {
    if (this.form.valid) {
      console.log('submit ' + operation, this.jsonFormData, event);
      console.log('submit ' + operation);
      switch (operation) {
        case OP_UPDATE:
          this.executeUpdate(this.jsonFormData);
          break;
        default:
          break;
      }
    }
  }

  onDetailForm(id) {
    if (!this.formActive) {
      this.jsonFormData = JSON.parse(JSON.stringify(this.resultSet.find(e => e.id === id)));

      this.operation = OP_UPDATE;

      this.fields[0].fieldGroup[1].templateOptions.readonly = false; //name
      this.fields[0].fieldGroup[2].templateOptions.disabled = true; //json_form
      this.fields[1].fieldGroup[0].templateOptions.disabled = false; //partition
      this.fields[1].fieldGroup[1].templateOptions.readonly = false; //offset
      this.fields[1].fieldGroup[2].templateOptions.disabled = false; //topic
      this.fields[1].fieldGroup[3].templateOptions.disabled = false; //timestamp


      this.formActive = true;
      console.log("detail: " + id);
    }

  }

  onBackDetailForm() {
    this.formActive = false;
    this.innerFormActive = false;
    console.log("back");
  }

  onCloseAlert(alert: any) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  executeUpdate(event: any) {
    this.dialogService.confirm('Conferma operazione', 'Sei sicuro di voler modificare il record?')
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per modificare il record
          this.restcl.updateReq(this.restURL + "update/" + event.id, JSON.stringify(event)).subscribe(
            (result) => {
              console.log('next from updateReq');
              this.alerts.push({ type: 'success', message: 'Modifica effettuata' });
              this.loadData();
              this.formActive = false;
            },
            (err) => {
              console.log('error from updateReq');
              this.alerts.push({ type: 'warning', message: 'Modifica NON riuscita' });
            },
            () => {
              console.log('complete from updateReq');

            }
          );
        }
      })
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  private openJsonView() {

    //vado a vedere il form interno quindi deve essere valorizzato almeno lo schema prima di aprire innerForm
    console.log('innerJsonFormData', this.innerJsonFormData)
    console.log('jsonFormData:', this.jsonFormData)

    if (!this.innerFormActive) {
      //assegno i dati all'editor
      this.editorData = JSON.parse(this.jsonFormData.json_form);
      this.innerFormActive = true;
    }
    else {
      this.innerFormActive = false;
    }
    console.log("innerFormActive:", this.innerFormActive);

  }

  editorOptions = {
    mode: 'code',
    modes: ['code'],
    name: "jsonContent",
    onError: function (err) {
      alert(err.toString())
    }
  };

  editorData: any = {};

  //-------- PAGINAZIONE -------
  page = 1;
  pageSize = 10;
  p_start = 0;
  p_end = 0;

  refreshList() {
    this.p_start = (this.page - 1) * this.pageSize;
    this.p_end = (this.page - 1) * this.pageSize + this.pageSize;
  }
  //-------- PAGINAZIONE -------

}
