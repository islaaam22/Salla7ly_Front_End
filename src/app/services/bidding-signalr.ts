import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Bid } from '../models/bid-models';

@Injectable({ providedIn: 'root' })
export class BiddingSignalRService {
  private readonly hubUrl = 'https://sala7ly.runasp.net/hubs/bidding';
  private connection!: signalR.HubConnection;

  private newBidSubject       = new Subject<Bid>();
  private bidCountSubject     = new Subject<{ requestId: number; count: number }>();
  private bidAcceptedSubject  = new Subject<{ bidId: number; requestId: number }>();
  private bidRejectedSubject  = new Subject<{ bidId: number }>();
  private bidWithdrawnSubject = new Subject<{ bidId: number }>();

  newBidReceived$  = this.newBidSubject.asObservable();
  bidCountUpdated$ = this.bidCountSubject.asObservable();
  bidAccepted$     = this.bidAcceptedSubject.asObservable();
  bidRejected$     = this.bidRejectedSubject.asObservable();
  bidWithdrawn$    = this.bidWithdrawnSubject.asObservable();

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  connect(token: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();
    return this.connection.start();
  }

  disconnect(): Promise<void> {
    return this.connection?.stop();
  }

  private registerHandlers(): void {
    this.connection.off('NewBidReceived');
    this.connection.off('BidCountUpdated');
    this.connection.off('BidAccepted');
    this.connection.off('BidRejected');
    this.connection.off('BidWithdrawn');

    this.connection.on('NewBidReceived', (bid: Bid) => {
      this.newBidSubject.next(bid);
    });
    this.connection.on('BidCountUpdated', (data: { requestId: number; count: number }) => {
      this.bidCountSubject.next(data);
    });
    this.connection.on('BidAccepted', (data: { bidId: number; requestId: number }) => {
      this.bidAcceptedSubject.next(data);
    });
    this.connection.on('BidRejected', (data: { bidId: number }) => {
      this.bidRejectedSubject.next(data);
    });
    this.connection.on('BidWithdrawn', (data: { bidId: number }) => {
      this.bidWithdrawnSubject.next(data);
    });
  }

  joinRequest(requestId: number): Promise<void> {
    if (!this.isConnected) return Promise.resolve();
    return this.connection.invoke('JoinRequest', requestId.toString());
  }

  leaveRequest(requestId: number): Promise<void> {
    if (!this.isConnected) return Promise.resolve();
    return this.connection.invoke('LeaveRequest', requestId.toString());
  }
}
