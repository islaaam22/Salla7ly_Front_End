import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidsByCategory } from './bids-by-category';

describe('BidsByCategory', () => {
  let component: BidsByCategory;
  let fixture: ComponentFixture<BidsByCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BidsByCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BidsByCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
