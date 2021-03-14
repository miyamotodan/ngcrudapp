import { Component, OnInit } from '@angular/core';
import { RestclService } from '../rest/restcl.service';
import { DialogService } from '../dialog/dialog.service';
import { FormGroup } from '@angular/forms'
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { ConfigLoaderService } from '../config/appconfig.service';
import { FileSaverService} from 'ngx-filesaver';
import { HttpClient } from '@angular/common/http';

//import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

import { toArray, OP_DELETE, OP_INSERT, OP_UPDATE, SC_JSONSCHEMA, SC_FORMLY, arrayOf } from '../util/util.module';

export interface IAnagSchema {
  id: number,
  name: string,
  active: boolean,
  type: string,
  json_form: string
}

@Component({
  selector: 'app-anag-schema',
  templateUrl: './anag-schema.component.html',
  styleUrls: ['./anag-schema.component.css']
})
export class AnagSchemaComponent implements OnInit {

  public resultSet: IAnagSchema[] = [];
  public formActive = false;
  public fileActive = false;
  public operation = "";
  public alerts: any[] = [{ type: 'info', message: 'i messaggi compaiono qui, chiudere prego' }];

  public restURL_AS: string;
  public restURL_MP: string;
  
  private deletableId = [];

  //schema dati della tabella mc_anag_schema
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
    {
      key: 'type',
      type: 'select',
      templateOptions: {
        label: 'Tipo',
        required: true,
        description: 'schema / layout',
        options: [
          { label: 'formly fields', value: SC_FORMLY },
          { label: 'jsonschema-form', value: SC_JSONSCHEMA }
        ]
      }
    },
    {
      key: 'name',
      type: 'input',
      templateOptions: {
        label: 'Name',
        required: true,
        readonly: false,
        description: 'nome dello schema'
      }
    },
    {
      key: 'active',
      type: 'checkbox',
      defaultValue: false,
      templateOptions: {
        label: 'Attivo',
        required: true,
      }
    },
    {
      key: 'json_form',
      type: 'input',
      templateOptions: {
        label: 'JSON',
        required: true,
        readonly: true,
        description: 'json di definizione dello schema',
        /*
        click: (field, $event) => {
            console.log(field);
        }
        */
      }
    }
  ];

  innerForm = new FormGroup({});
  public innerJsonFormData: any = {};
  innerFields: FormlyFieldConfig[] = [];
  innerFormActive: boolean = false;
  
  private httpClient: HttpClient

  private json_form_object: object;

  constructor(private restcl: RestclService, 
              private dialogService: DialogService, 
              private formlyJsonschema: FormlyJsonschema, 
              private configLoaderService: ConfigLoaderService, 
              private fileSaverService: FileSaverService) {

    this.restURL_AS = this.configLoaderService.apiBaseUrl + "/anag_schemas/";
    this.restURL_MP = this.configLoaderService.apiBaseUrl + "/master_pipeline/";
  }

  ngOnInit(): void {
    this.loadData();
    this.loadDeletablesData();
  }

  //raccoglie tutti gli id_schema usati nei dati in master_metadata questo controllo non è esaustivo perché viene fatto al momento 
  //dell'apertura dell'intefaccia e non assicura che qualcuno nel frattempo non inserisca un dato con quello schema (va fatta una 
  //constraint al livello di DB per avere la certezza di non cancellare schemi usati)
  loadDeletablesData() {
    this.restcl.readReq(this.restURL_MP, "").subscribe((result) => {
      this.resultSet = toArray(JSON.parse(result.responseText));
      this.deletableId = arrayOf("id_schema", this.resultSet);
      console.log("did ",this.deletableId)
    });
  }

  //carica i dati nella tabella degli schemi
  loadData(): void {
    this.restcl.readReq(this.restURL_AS, "").subscribe((result) => {
      this.resultSet = toArray(JSON.parse(result.responseText));
      this.refreshList();
      console.log("ldas: ",this.restURL_AS);
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
      this.json_form_object = this.toObj(this.jsonFormData.json_form);
      this.operation = OP_UPDATE;
      this.fields[1].templateOptions.readonly = false; //name
      this.formActive = true;
      this.fileActive = false;
      console.log("detail: " + id);
    }
  }

  onDeleteForm(id) {
    if (!this.formActive) {
      this.jsonFormData = JSON.parse(JSON.stringify(this.resultSet.find(e => e.id === id)));
      this.operation = OP_DELETE;
      this.fields[1].templateOptions.readonly = true; //name
      this.formActive = true;
      this.fileActive = false;
      console.log("delete:" + id);
    }
  }

  onInsertForm() {
    if (!this.formActive) {
      this.jsonFormData = { id: 0, name: "", active: false, json_form: "" };
      this.json_form_object = {};
      this.operation = OP_INSERT;
      this.fields[1].templateOptions.readonly = false; //name
      this.formActive = true;
      this.fileActive = false;
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
    this.fileActive = false;
    this.innerFormActive = false;
    console.log("back");
  }

  onCloseAlert(alert: any) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  executeInsert(event: any, msg:string) {
    this.dialogService.confirm('Conferma operazione', msg)
      .then((confirmed) => {
        console.log('User confirmed:', confirmed);
        if (confirmed) {
          //chiamo il servizio per creare il record
          this.restcl.createReq(this.restURL_AS, JSON.stringify(event)).subscribe(
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
          this.restcl.updateReq(this.restURL_AS + "update/" + event.id, JSON.stringify(event)).subscribe(
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
          this.restcl.deleteReq(this.restURL_AS + event.id, JSON.stringify(event)).subscribe(
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

  public selectedFile: any;

  onFileSelect(event) {
    //console.log(event);
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = reader.result.toString().trim();
      this.editorData = this.toObj(text);
      this.lastEditorData = text;
      
    }
    reader.readAsText(this.selectedFile);
  }

  onFileDownload(type: string, fromRemote: boolean) {
    const fileName = `save.${type}`;
    if (fromRemote) {
      this.httpClient.get(`assets/files/demo.${type}`, {
        observe: 'response',
        responseType: 'blob'
      }).subscribe(res => {
        this.fileSaverService.save(res.body, fileName);
      });
      return;
    }
    const fileType = this.fileSaverService.genType(fileName);

    let jd = JSON.stringify(this.editorData, null, 2);
    if (this.toFormly && this.jsonFormData.type===SC_JSONSCHEMA) {
      console.log('conversione --> formly')
      jd = JSON.stringify([this.formlyJsonschema.toFieldConfig(this.editorData.schema)],null,2);
    }     
    console.log('scrittura file');
    const txtBlob = new Blob([jd], { type: fileType });
    this.fileSaverService.save(txtBlob, fileName);

    this.toFormly = false;
  }

  public toObj(e: string) {

    var obj: object = {};
    try {
      obj = JSON.parse(e);
    } catch (error) {

    }
    return obj;

  }

  onShowForm(e) {

    if (this.jsonFormData.type === SC_FORMLY)
      //assegno all'innerform lo schema 
      this.innerFields = JSON.parse(this.jsonFormData.json_form);
    else {
      //trasformo in fields lo schema e lo assegno all'innerform 
      let jf = JSON.parse(this.jsonFormData.json_form);
      console.log('jf', jf);

      this.innerFields = [this.formlyJsonschema.toFieldConfig(jf.schema)];
      this.innerJsonFormData = jf.model;
    }

    this.innerFormActive = !this.innerFormActive;
  }

  onEditSchema() {

    console.log("fileActive:" + this.fileActive);

    if (this.fileActive) { //chiusura

      //SPOSTATO DALLA PARTE DI CARICAMENTO FILE
      let text = this.lastEditorData;
      this.jsonFormData = {
        ...this.jsonFormData,
        json_form: text
      }
      this.json_form_object = this.toObj(text);

    } else { //apertura
      this.editorData = this.json_form_object;
      this.lastEditorData = JSON.stringify(this.editorData);
    }

    this.fileActive = !this.fileActive;
    this.innerFormActive = false;

  }

  public toFormly=false;
  /*
  onToFormly () {
    console.log(this.toFormly);
  }
  */

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
    },
    /*
    onEvent: function(node, event) {
      console.log("onEvent");
      if (node.value !== undefined) {
        console.log(event.type + ' event ' +
          'on value ' + JSON.stringify(node.value) + ' ' +
          'at path ' + JSON.stringify(node.path)
        )
      } else {
        console.log(event.type + ' event ' +
          'on field ' + JSON.stringify(node.field) + ' ' +
          'at path ' + JSON.stringify(node.path)
        )
      }
    }
    */
  };

  editorData: any;
  lastEditorData: string = "";

  onFormChange(event) {
    console.log("onFormChange: ", event);
    //this.editorData = JSON.parse(JSON.stringify(this.model));
  }

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
