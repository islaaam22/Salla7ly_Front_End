import { TestBed } from '@angular/core/testing';

import { ChatSignalRService } from './chat-signalr';

describe('ChatSingnalr', () => {
  let service: ChatSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
