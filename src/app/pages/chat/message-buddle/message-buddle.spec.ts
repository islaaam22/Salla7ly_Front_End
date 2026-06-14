import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageBuddle } from './message-buddle';

describe('MessageBuddle', () => {
  let component: MessageBuddle;
  let fixture: ComponentFixture<MessageBuddle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBuddle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageBuddle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
