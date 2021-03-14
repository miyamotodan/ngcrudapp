import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnagTableComponent } from './anag-table/anag-table.component';
import { AboutComponent } from './about/about.component';
import { AnagSchemaComponent } from './anag-schema/anag-schema.component';
import { HomeComponent } from './home/home.component';
import { MetadataComponent } from './metadata/metadata.component';
import { TestComponent } from './test/test.component';
import { MetadataInstanceComponent } from './metadata-instance/metadata-instance.component';

const routes: Routes = [
  {
      path: 'home',
      component: HomeComponent
  },
  {
    path: 'anag-schema',
    component: AnagSchemaComponent
  },
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: 'anag-table',
    component: AnagTableComponent
  },
  {
      path: 'about',
      component: AboutComponent
  },
  {
      path: 'metadata',
      component: MetadataComponent
  },
  {
      path: 'metadata-instance',
      component: MetadataInstanceComponent
  },
  {
      path: '',
      component: HomeComponent
  },
  {
      path: '**',
      component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
