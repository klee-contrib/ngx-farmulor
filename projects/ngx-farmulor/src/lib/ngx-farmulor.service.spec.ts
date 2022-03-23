import { TestBed } from '@angular/core/testing';

import { cleanEmpties, NgxFarmulorService } from './ngx-farmulor.service';

describe('NgxFarmulorService', () => {
  let service: NgxFarmulorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFarmulorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('CleanEmpties', () => {
    const toTest: Object = { a: null, b: "toto", c: { c1: undefined, c2: [], c3: "C3" } };
    cleanEmpties(toTest)
    expect(toTest).toEqual({ b: "toto", c: { c3: "C3" } })
  });
});
