import { Component, OnInit } from '@angular/core';
import { RestclService } from '../rest/restcl.service';
import { DialogService } from '../dialog/dialog.service';
import { IAnagSchema } from '../anag-schema/anag-schema.component'
import { IAnagTable } from '../anag-table/anag-table.component'
import { FormGroup } from '@angular/forms'
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { ConfigLoaderService } from '../config/appconfig.service';
import { ActivatedRoute } from '@angular/router';
import { Router, Event } from '@angular/router';
import { NavigationStart, NavigationError, NavigationEnd } from '@angular/router';

import { toArray, OP_DELETE, OP_INSERT, OP_UPDATE, SC_FORMLY, SC_JSONSCHEMA, arrayOf } from '../util/util.module';

export interface IMetadata {
  id: number,
  name: string,
  type: string,
  signature: boolean,
  json_form: string,
  id_schema: number,
  extended_id_schema: string
}

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit {

  //result set per la query sull'anagrafica tabelle
  public resultSet_AT: IAnagTable[] = [];
  //result set per la tabella dei metadati
  public resultSet: any[] = [];
  //tabella scelta sull'anagrafica 
  public metadataTable: string;

  //lista degli schemi
  private ls: IAnagSchema[] = [];
  private lsF: IAnagSchema[] = [];

  public formActive = false;
  public innerFormActive = false;
  public operation = "";
  public alerts: any[] = [{ type: 'info', message: 'i messaggi compaiono qui, chiudere prego' }];

  //url base i servizi sulle tabelle dei metadati
  private restURL_base: string;
  //url per i servizi sull'anagrafica delle tabelle
  private restURL_AT: string;
  //url per i servizi sull'anagrafica delle degli schemi
  private restURL_AS: string;
  //url che viene composta per la specifica tabella dei metadati
  private restURL: string;
  private tableSelected = ""

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
      key: 'id',
      type: 'input',
      defaultValue: 0,
      templateOptions: {
        label: 'id',
        type: 'number',
        min: 0,
        required: true,
        readonly: true,
        description: 'id univoco'
      }
    },
      /*
      validators: {
        id_schema: {
          expression: (fc) => {
            if (this.resultSet.find(e => e.id === this.jsonFormData.id).id_schema !== fc.value)
              return false;
            else
              return true;
          },
          message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" non puoi cambiare schema`,
        }
      }
      */
    {
      key: 'name',
      type: 'input',
      templateOptions: {
        label: 'Name',
        placeholder: 'es:daniele',
        required: true,
        description: 'Nome utente',
      }
    },
    {
      key: 'surname',
      type: 'input',
      templateOptions: {
        label: 'Surname',
        placeholder: 'es:del pinto',
        required: true,
        description: 'Cognome utente',
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
        required: false,
        description: 'Mail utente',
      }
    }
  ];

  innerForm = new FormGroup({});
  public innerJsonFormData: any = {};
  innerFields: FormlyFieldConfig[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private restcl: RestclService, private dialogService: DialogService, private formlyJsonschema: FormlyJsonschema, private configLoaderService: ConfigLoaderService) {

    this.restURL_base = this.configLoaderService.apiBaseUrl;
    this.restURL_AT = this.restURL_base + "/anag_table/";
    //this.restURL_AS = this.restURL_base + "/mc_anag_schemas/";
    this.restURL_AS = this.restURL_base + "/anag_schemas/";

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
      this.resultSet = this.resultSet.map(e => { return { ...e, extended_id_schema: this.ls.filter(s => Number(s.id) == Number(e.id_schema))[0].name } });
      this.refreshList();
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
      //console.log(u);
      //console.log(this.resultSet_AT);
    });
  }

  loadDataSchemaTable(): void {

    //result set per la query sull'anagrafica schemi
    var resultSet_AS: IAnagSchema[] = [];
    this.restcl.readReq(this.restURL_AS, "").subscribe((result) => {

      resultSet_AS = toArray(JSON.parse(result.responseText));
      //console.log(this.restURL_AS);
      //console.log(resultSet_AS);
      this.ls = resultSet_AS.filter(e => e.type == SC_JSONSCHEMA || e.type == SC_FORMLY);
      //console.log('ls:', this.ls)
      this.lsF = resultSet_AS.filter(e => e.active == true)
      //console.log("lsf: ", this.lsF)

      //gli schemi possono differire perché ogni record è un dataset diverso quindi il form
      //si può aprire solo dopo aver scelto lo schema e il layout da quelli disponibili
      this.fields[1].templateOptions.options = this.ls.map(e => { return { value: e.id, label: e.name + ' [' + e.type + '] (' + e.id + ')' }; });

      //carica i dati della tabella
      this.loadData();

    });
  }

  setMetadataTable(table_name): void {
    this.metadataTable = table_name;
    this.restURL = this.restURL_base + "/" + table_name + "/";

    //carica i dati dell'anagrafica degli schemi
    this.loadDataSchemaTable();

  }

  onSubmitForm(event, operation): void {
    if (this.form.valid) {
      console.log('submit ' + operation, this.jsonFormData, event);
      console.log('submit ' + operation);
      switch (operation) {
        case OP_UPDATE:
          this.executeUpdate(this.jsonFormData);
          break;
        case OP_DELETE:
          this.executeDelete(this.jsonFormData);
          break;
        case OP_INSERT:
          this.executeInsert(this.jsonFormData, 'Sei sicuro di voler inserire il record?');
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

      this.fields[1].templateOptions.disabled = true; //id_schema
      this.fields[2].templateOptions.readonly = false; //name
      this.fields[3].templateOptions.readonly = false; //signature
      this.fields[4].templateOptions.disabled = false; //json_form

      this.formActive = true;
      console.log("detail: " + id);
    }

  }

  onDeleteForm(id) {
    if (!this.formActive) {
      this.jsonFormData = JSON.parse(JSON.stringify(this.resultSet.find(e => e.id === id)));

      this.operation = OP_DELETE;

      this.fields[1].templateOptions.disabled = true; //id_schema
      this.fields[2].templateOptions.readonly = true; //name
      this.fields[3].templateOptions.readonly = true; //signature
      this.fields[4].templateOptions.disabled = true; //json_form

      this.formActive = true;
      console.log("delete:" + id);
    }

  }

  onInsertForm() {
    if (!this.formActive) {
      this.jsonFormData = { id: 0, id_schema: null, signature: false, json_form: '' };
      this.fields[1].templateOptions.options = [];
      for (var i in this.lsF) {
        this.fields[1].templateOptions.options.push({
          label: this.lsF[i].name + " [" +
            this.lsF[i].type + "] (" +
            this.lsF[i].id + ")",
          value: this.lsF[i].id
        })
      }

      this.operation = OP_INSERT;

      this.fields[1].templateOptions.disabled = false; //id_schema
      this.fields[2].templateOptions.readonly = false; //name
      this.fields[3].templateOptions.readonly = false; //signature
      this.fields[4].templateOptions.disabled = false; //json_form

      this.formActive = true;
      console.log("insert");
    }

  }

  onCloneForm(id) {
    if (!this.formActive) {
      //creo un record clonato
      this.jsonFormData = JSON.parse(JSON.stringify(this.resultSet.find(e => e.id === id)));
      this.jsonFormData.id = null;
      this.jsonFormData.name += ' [CLONE]';
      //chiamo il servizio per inserire il record
      this.executeInsert(this.jsonFormData, 'Sei sicuro di voler clonare il record?');
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

  executeInsert(event: any, msg: string) {
    this.dialogService.confirm('Conferma operazione', msg)
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per creare il record
          this.restcl.createReq(this.restURL, JSON.stringify(event)).subscribe(
            (result) => {
              console.log('next from createReq');
              this.alerts.push({ type: 'success', message: 'Inserimento effettuato' });
              this.loadData();
              this.formActive = false;
            },
            (err) => {
              console.log('error from createReq');
              this.alerts.push({ type: 'warning', message: 'Inserimento NON riuscito' });
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
              this.alerts.push({ type: 'warning', message: 'Cancellazione NON riuscita' });
            },
            () => {
              console.log('complete from deleteReq');

            }
          );
        }
      })
      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  private openInnerForm() {

    //vado a vedere il form interno quindi deve essere valorizzato almeno lo schema prima di aprire innerForm
    console.log('jsonFormData:', this.jsonFormData);

    if (!this.innerFormActive)
      if (this.jsonFormData.id_schema) {

        let s = this.ls.find(e => e.id === this.jsonFormData.id_schema);
        if (s.type === SC_FORMLY)
          //assegno all'innerform lo schema 
          this.innerFields = JSON.parse(s.json_form);
        else {
          //trasformo in fields lo schema e lo assegno all'innerform 
          let jf = JSON.parse(s.json_form);
          this.innerFields = [this.formlyJsonschema.toFieldConfig(jf.schema)];
        }

        //assegno all'innerform i dati
        if (this.jsonFormData.json_form) this.innerJsonFormData = JSON.parse(this.jsonFormData.json_form);
        else this.innerJsonFormData = {};
        this.innerFormActive = true;

        //assegno i dati all'editor
        this.editorData = JSON.parse(JSON.stringify(this.innerJsonFormData));
        this.lastEditorData = JSON.stringify(this.innerJsonFormData);

      } else {
        this.innerFields = [];

      }
    else {
      this.innerFormActive = false;
      //prelevo i dati del form interno e li assegno al campo json_form dei dati principali
      this.jsonFormData = {
        ...this.jsonFormData,
        json_form: JSON.stringify(this.innerJsonFormData, null, '\t')
      }

      //se il form interno non è valido il flag di validità non può essere true
      if (this.innerForm.valid) {
        console.log('innerForm valido')
        //abilito il flag di validità, può essere deciso dall'utente
        this.fields[3].templateOptions.disabled = false;
      } else {
        console.log('innerForm non valido')
        //metto a false il flag di validità e lo imposto readonly, non può essere deciso dall'utente
        this.fields[3].templateOptions.disabled = true;
        this.jsonFormData.signature = false;
      }

      console.log('innerJsonFormData', this.innerJsonFormData)
      console.log('jsonFormData:', this.jsonFormData)
    }

    console.log("innerFormActive:", this.innerFormActive);

  }

  editorOptions = {
    mode: 'tree',
    //modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
    modes: ['tree', 'preview'],
    name: "jsonContent",
    onError: function (err) {
      alert(err.toString())
    },
    onChangeJSON: (json) => {
      console.log("onChangeJSON", json);
      this.lastEditorData = JSON.stringify(json);
      this.innerJsonFormData = JSON.parse(JSON.stringify(json));
    },
  };

  editorData: any = {};
  lastEditorData: string = "";

  onFormChange(event) {
    this.editorData = JSON.parse(JSON.stringify(this.innerJsonFormData));
  }

  /*
  onEditorChange(event) {
    this.innerJsonFormData = JSON.parse(JSON.stringify(event));
  }
  */


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
