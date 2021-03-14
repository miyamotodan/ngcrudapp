import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class UtilModule { }

export function toArray(param: any): any {
  if (!Array.isArray(param)) return [param]
  else return param;
}

export function arrayOf(key, arr) {

  //genera un array con i valori di tutti gli elementi con una particolare key di un oggetto
  try {
    var test = []
    for (var i in arr) {
      eval('test.push(arr[i].' + key + ');')
    }
    return test;
  } catch { console.log("message: error aO") }

}

export const OP_UPDATE = 'dettaglio';
export const OP_INSERT = 'nuovo';
export const OP_DELETE = 'elimina';

export const SC_FORMLY = 'formly';
export const SC_JSONSCHEMA = 'schema';

