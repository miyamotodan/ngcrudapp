import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnagSchemaComponent } from './anag-schema.component';

describe('AnagSchemaComponent', () => {
  let component: AnagSchemaComponent;
  let fixture: ComponentFixture<AnagSchemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnagSchemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnagSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
