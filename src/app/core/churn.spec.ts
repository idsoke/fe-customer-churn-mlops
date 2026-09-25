import { TestBed } from '@angular/core/testing';
import { Churn } from './churn';

describe('Churn', () => {
  let service: Churn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Churn);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
