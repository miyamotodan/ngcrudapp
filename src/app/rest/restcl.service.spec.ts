import { TestBed } from '@angular/core/testing';

import { RestclService } from './restcl.service';

describe('RestclService', () => {
  let service: RestclService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestclService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
