import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface WithdrawalRecord {
  amount: number;
  month: string;
  statusLabel: string;
  statusClass: string;
  statusIcon: string;
}

interface MonthlyPerformance {
  month: string;
  amount: number;
  percentHeight: number;
}

@Component({
  selector: 'app-wallet',
  imports: [CommonModule],
  templateUrl: './wallett.html',
  styleUrl: './wallett.css',
})
export class Wallet implements OnInit{
 // top cards
  pendingBalance = 820;
  pendingDays = 7;
  totalWithdrawn = 15400;
  availableBalance = 4250;
  growthPercent = 12;

  // withdrawal history
  withdrawalHistory: WithdrawalRecord[] = [
    {
      amount: 4100,
      month: 'أبريل',
      statusLabel: 'مكتمل',
      statusClass: 'status-completed',
      statusIcon: 'fa-solid fa-circle-check',
    },
    {
      amount: 3850,
      month: 'مارس',
      statusLabel: 'مكتمل',
      statusClass: 'status-completed',
      statusIcon: 'fa-solid fa-circle-check',
    },
    {
      amount: 3200,
      month: 'فبراير',
      statusLabel: 'مكتمل',
      statusClass: 'status-completed',
      statusIcon: 'fa-solid fa-circle-check',
    },
    {
      amount: 4250,
      month: 'اليوم',
      statusLabel: 'قيد المعالجة',
      statusClass: 'status-pending',
      statusIcon: 'fa-regular fa-clock',
    },
  ];

  // performance chart (last 4 months)
  monthlyPerformance: MonthlyPerformance[] = [];

  private rawPerformance: { month: string; amount: number }[] = [
    { month: 'يناير', amount: 3200 },
    { month: 'فبراير', amount: 3850 },
    { month: 'مارس', amount: 4100 },
    { month: 'أبريل', amount: 4250 },
  ];

  ngOnInit(): void {
    const maxAmount = Math.max(...this.rawPerformance.map((m) => m.amount));
    this.monthlyPerformance = this.rawPerformance.map((m) => ({
      ...m,
      percentHeight: Math.round((m.amount / maxAmount) * 100),
    }));
  }

  withdrawEarnings(): void {
    // TODO: replace with real Stripe Connect withdrawal API call
    console.log('Withdraw earnings clicked — available balance:', this.availableBalance);
  }
}



