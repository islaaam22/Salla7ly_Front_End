import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitBids } from './submit-bids';

describe('SubmitBids', () => {
  let component: SubmitBids;
  let fixture: ComponentFixture<SubmitBids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitBids]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitBids);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
