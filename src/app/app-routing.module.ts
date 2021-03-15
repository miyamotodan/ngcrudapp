import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnagTableComponent } from './anag-table/anag-table.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  {
      path: 'home',
      component: HomeComponent
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
