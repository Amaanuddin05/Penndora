import { TestBed } from '@angular/core/testing';

import { SimpleInterestService } from './simple-interest.service';

describe('SimpleInterestService', () => {
  let service: SimpleInterestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleInterestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
