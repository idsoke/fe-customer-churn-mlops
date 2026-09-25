import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Predictor } from './predictor';

describe('Predictor', () => {
  let component: Predictor;
  let fixture: ComponentFixture<Predictor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Predictor],
    }).compileComponents();

    fixture = TestBed.createComponent(Predictor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
