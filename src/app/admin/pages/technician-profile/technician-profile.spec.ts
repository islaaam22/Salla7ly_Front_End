import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianProfile } from './technician-profile';

describe('TechnicianProfile', () => {
  let component: TechnicianProfile;
  let fixture: ComponentFixture<TechnicianProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
