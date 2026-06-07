import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoAreWe } from './who-are-we';

describe('WhoAreWe', () => {
  let component: WhoAreWe;
  let fixture: ComponentFixture<WhoAreWe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoAreWe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhoAreWe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
