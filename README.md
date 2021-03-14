# ngcrudapp 

applicazione angular di esempio per un crud con backend node e frontend basato su bootstrap e formly.

La struttura del progetto nellse sue componenti principali:

```
project
│   README.md   : questo file
└─── dist       : build webapp (da pubblicare su Apache)     
└─── src        : sorgenti webapp
│   └─── assets : configurazione webapp
```
La struttura dell'applicazione web è semplificata e il numero di moduli e componenti minimale per effettuare un CRUD essenziale sulle tabelle in particolare ci sono i componenti, le librerie installate e i servizi di base per:
- comunicazione con API rest
- configurazione applicativa
- gestione paginata e ordinata delle liste
- gestione degli alert
- gestione delle finestre di dialogo
- gestione e configurazione dei form

in questo modo è facile replicare le funzioni per implementare nuove interfacce applicative (previa implementazione della corrispondente parte di backend).

I form vengono gestiti con la libreria [formly](https://formly.dev/) che può prendere in carico anche configurazioni realizzate con la modalità json-schema sullo stile [jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form).


**avvio**

>mvn spring-boot:run

___________________________


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## deploy on remote virtual host

ng build --baseHref=/virtualhost/ --deployUrl=/virtualhost/