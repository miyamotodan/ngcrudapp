import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Anag-tableComponent } from './anag-table.component';

describe('Anag-tableComponent', () => {
  let component: Anag-tableComponent;
  let fixture: ComponentFixture<Anag-tableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Anag-tableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Anag-tableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
