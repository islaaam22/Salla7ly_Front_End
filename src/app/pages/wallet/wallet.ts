import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface Transaction {
  title: string;
  date: string;
  amount: number;
  type: 'in' | 'out';
}

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class Wallet implements OnInit{
 balance = 450;
  showTopUpModal = false;
  topUpAmount: number | null = null;
  quickAmounts = [50, 100, 200, 500];

  transactions: Transaction[] = [
    { title: 'شحن رصيد', date: 'اليوم، 10:30 ص', amount: 200, type: 'in' },
    { title: 'دفع طلب صيانة تكييف', date: 'أمس، 3:15 م', amount: 120, type: 'out' },
    { title: 'شحن رصيد', date: '28 يونيو 2026', amount: 300, type: 'in' },
    { title: 'دفع طلب سباكة', date: '25 يونيو 2026', amount: 80, type: 'out' },
    { title: 'استرداد مبلغ', date: '20 يونيو 2026', amount: 50, type: 'in' },
  ];

  ngOnInit(): void {}

  openTopUpModal(): void {
    this.showTopUpModal = true;
    this.topUpAmount = null;
  }

  closeTopUpModal(): void {
    this.showTopUpModal = false;
    this.topUpAmount = null;
  }

  confirmTopUp(): void {
    if (!this.topUpAmount || this.topUpAmount <= 0) return;
    // TODO: replace with real API call
    this.balance += this.topUpAmount;
    this.transactions.unshift({
      title: 'شحن رصيد',
      date: 'الآن',
      amount: this.topUpAmount,
      type: 'in',
    });
    this.closeTopUpModal();
    }
}
