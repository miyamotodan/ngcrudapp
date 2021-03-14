import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataInstanceComponent } from './metadata-instance.component';

describe('MetadataInstanceComponent', () => {
  let component: MetadataInstanceComponent;
  let fixture: ComponentFixture<MetadataInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
