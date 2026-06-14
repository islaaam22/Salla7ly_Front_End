import { TestBed } from '@angular/core/testing';

import { ChatSingnalr } from './chat-singnalr';

describe('ChatSingnalr', () => {
  let service: ChatSingnalr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSingnalr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
