import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedBids } from './received-bids';

describe('ReceivedBids', () => {
  let component: ReceivedBids;
  let fixture: ComponentFixture<ReceivedBids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedBids]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedBids);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
