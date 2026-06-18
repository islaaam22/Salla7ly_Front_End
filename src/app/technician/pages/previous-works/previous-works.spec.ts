import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousWorks } from './previous-works';

describe('PreviousWorks', () => {
  let component: PreviousWorks;
  let fixture: ComponentFixture<PreviousWorks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousWorks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousWorks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
