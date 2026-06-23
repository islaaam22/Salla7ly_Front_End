import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerSidebar } from "../customer-sidebar/customer-sidebar";


interface Transaction {
  title: string;
  date: string;
  amount: number;
  type: 'in' | 'out';
}

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule, CustomerSidebar],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class Wallet {
balance = 450;

  transactions: Transaction[] = [
    { title: 'دفع لـ م. أحمد فاروق', date: 'اليوم', amount: 250, type: 'out' },
    { title: 'شحن المحفظة عبر Stripe', date: 'أمس', amount: 200, type: 'in' },
    { title: 'دفع لـ م. علي حسن', date: 'منذ 3 أيام', amount: 220, type: 'out' },
    { title: 'استرداد رصيد', date: 'منذ أسبوع', amount: 50, type: 'in' },
  ];

  showTopUpModal = false;
  topUpAmount = '';

  openTopUpModal() {
    this.showTopUpModal = true;
  }

  closeTopUpModal() {
    this.showTopUpModal = false;
    this.topUpAmount = '';
  }
}
