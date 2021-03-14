import { Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFormOptions, FormlyFieldConfig } from "@ngx-formly/core";
import { FormlyJsonschema } from "@ngx-formly/core/json-schema";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent {

  //---- GRAPH----

  //cards
  single = [];
  multi = [{}];

  view: any[] = [400, 320];
  colorScheme = { domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'] };
  cardColor: string = '#232837';
  animations = false;

  // bars
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Investments';
  showYAxisLabel = true;
  yAxisLabel = 'Values';

  // line
  showLabels: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  timeline: boolean = true;

  //---- GRAPH----

  form = new FormGroup({});
  model: any = {
    "investments": [
      {
        "investmentName": "primo",
        "investmentDate": "2021-02-25",
        "value": "1000"
      },
      {
        "investmentName": "secondo",
        "investmentDate": "2021-02-26",
        "value": "1500"
      }
    ]
  };
  options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = [
    {
      key: 'investments',
      type: 'array',
      templateOptions: {
        addText: 'Add another investment',
        plus: '+ investimento',
        minus: '- investimento'
      },
      fieldArray: {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-sm-4',
            type: 'input',
            key: 'investmentName',
            templateOptions: {
              label: 'Name of Investment:',
              required: true,
              addonLeft: {
                text: '$',
              }
            },
          },
          {
            type: 'input',
            key: 'investmentDate',
            className: 'col-sm-4',
            templateOptions: {
              type: 'date',
              label: 'Date of Investment:',
            },
          },
          {
            type: 'input',
            key: 'value',
            className: 'col-sm-4',
            templateOptions: {
              label: 'Value:',
            },
          },
        ],
      },
    },
  ];

  //ricavo il json da graficare dal json dei dati
  toGraph() {
    
    this.single = this.model.investments.map(
      e => {
        return { name: e.investmentDate, value: e.value }
      }
    )

    //console.log(this.single);
    
    //lo duplico altrimenti il grafico non recepisce le modifiche
    this.multi = [...this.multi];
    //lo duplico così il sort si applica solo all'ultimo grafico
    var singleCopy = [...this.single];
    this.multi[0] =  { name: 'serie', series: singleCopy.sort(
      (a,b)=> {
        let aa = new Date(a.name); 
        let bb = new Date(b.name);
        return aa.getTime()-bb.getTime();
       }
    )};

    //console.log(this.multi);
      
  }

  constructor(private formlyJsonschema: FormlyJsonschema) {
    this.toGraph();
  }

  submit() {
    let text = JSON.stringify(this.model);
    // console.log(text);
    this.editorData = JSON.parse(JSON.stringify(this.model));
    /*
    this.editorData = {
      ...this.editorData,
      json_form: text
    }
    */
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
      this.model = JSON.parse(JSON.stringify(json));
      this.toGraph();
    },
  };

  lastEditorData: string = "";
  editorData: any = this.model;

  /*
  onEditorChange(event) {
    console.log(event);
    this.model = JSON.parse(JSON.stringify(event));
  }
  */

  onFormChange(event) {
    //console.log(event);
    this.editorData = JSON.parse(JSON.stringify(this.model));
    this.toGraph();
  }


  onSelect(event) {
    console.log(event);
    this.toGraph();
  }

  //##patch per il refresh dei grafici
  onSelectTab() {
    window.dispatchEvent(new Event('resize'));
  }

}



export interface MySchema {
  hidden: boolean;
  disabled: boolean;
}

