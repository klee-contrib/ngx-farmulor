import { TestBed } from '@angular/core/testing';

import { NgxFarmulorService } from './ngx-farmulor.service';

describe('NgxFarmulorService', () => {
  let service: NgxFarmulorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFarmulorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
