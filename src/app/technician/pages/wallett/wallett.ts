import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  WalletService,
  WalletData,
  WalletTransaction,
} from '../../../services/wallet-service';

interface MonthlyPerformance {
  month: string;
  amount: number;
  percentHeight: number;
}

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './wallett.html',
  styleUrl: './wallett.css',
})
export class Wallet implements OnInit {
  constructor(private walletService: WalletService) {}

  // top cards — driven by real /api/wallet data
  pendingBalance = 0;
  pendingDays = 7; // not returned by the API yet; kept as a static hint in the UI
  totalWithdrawn = 0;
  availableBalance = 0;
  currency = 'EGP';

  // derived from totalEarned/totalWithdrawn trend — best-effort until the API exposes a real delta
  growthPercent = 0;

  transactions: WalletTransaction[] = [];
  withdrawalHistory: WalletTransaction[] = [];
  monthlyPerformance: MonthlyPerformance[] = [];

  isLoading = true;
  loadError = false;

  // withdraw modal state
  showWithdrawModal = false;
  withdrawAmount: number | null = null;
  bankAccount = '';
  isSubmittingWithdraw = false;
  withdrawError = '';

  ngOnInit(): void {
    this.loadWallet();
  }

  private loadWallet(): void {
    this.isLoading = true;
    this.loadError = false;

    this.walletService.getWallet().subscribe({
      next: (res) => {
        const data: WalletData | undefined = res?.data;
        this.pendingBalance = data?.pendingBalance ?? 0;
        this.totalWithdrawn = data?.totalWithdrawn ?? 0;
        this.availableBalance = data?.balance ?? 0;
        this.currency = data?.currency || 'EGP';

        this.transactions = this.walletService.extractTransactions(res);
        this.withdrawalHistory = this.transactions.filter((t) => this.isWithdrawal(t));
        this.buildMonthlyPerformance(this.transactions);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
      },
    });
  }

  private isWithdrawal(tx: WalletTransaction): boolean {
    const t = (tx.type || '').toLowerCase();
    return t === 'withdraw' || t === 'withdrawal';
  }

  /** Groups deposit-type transactions by Arabic month name for the last-4-months bar chart. */
  private buildMonthlyPerformance(transactions: WalletTransaction[]): void {
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];

    const totalsByMonth = new Map<string, number>();
    for (const tx of transactions) {
      const d = new Date(tx.createdOn);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + tx.amount);
    }

    const sortedKeys = Array.from(totalsByMonth.keys()).sort().slice(-4);
    const raw = sortedKeys.map((key) => {
      const [, monthIdx] = key.split('-').map(Number);
      return { month: monthNames[monthIdx], amount: totalsByMonth.get(key)! };
    });

    const maxAmount = Math.max(1, ...raw.map((m) => m.amount));
    this.monthlyPerformance = raw.map((m) => ({
      ...m,
      percentHeight: Math.round((m.amount / maxAmount) * 100),
    }));

    if (raw.length >= 2) {
      const last = raw[raw.length - 1].amount;
      const prev = raw[raw.length - 2].amount || 1;
      this.growthPercent = Math.round(((last - prev) / prev) * 100);
    }
  }

  // ── withdraw modal ───────────────────────────────────────────

  openWithdrawModal(): void {
    this.showWithdrawModal = true;
    this.withdrawAmount = null;
    this.bankAccount = '';
    this.withdrawError = '';
  }

  closeWithdrawModal(): void {
    if (this.isSubmittingWithdraw) return;
    this.showWithdrawModal = false;
    this.withdrawError = '';
  }

  confirmWithdraw(): void {
    if (!this.withdrawAmount || this.withdrawAmount <= 0) {
      this.withdrawError = 'أدخل مبلغاً صحيحاً أكبر من صفر';
      return;
    }
    if (this.withdrawAmount > this.availableBalance) {
      this.withdrawError = 'المبلغ أكبر من الرصيد المتاح للسحب';
      return;
    }
    if (!this.bankAccount.trim()) {
      this.withdrawError = 'أدخل رقم الحساب البنكي';
      return;
    }

    this.isSubmittingWithdraw = true;
    this.withdrawError = '';

    this.walletService.withdraw(this.withdrawAmount, this.bankAccount.trim()).subscribe({
      next: () => {
        this.isSubmittingWithdraw = false;
        this.showWithdrawModal = false;
        this.loadWallet(); // refresh balances + history from the server
      },
      error: () => {
        this.isSubmittingWithdraw = false;
        this.withdrawError = 'حصل خطأ أثناء طلب السحب، حاول تاني';
      },
    });
  }

  // kept for the old template binding name; now just opens the modal
  withdrawEarnings(): void {
    this.openWithdrawModal();
  }

  // ── display helpers ──────────────────────────────────────────

  txMonthLabel(tx: WalletTransaction): string {
    const d = new Date(tx.createdOn);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-EG', { month: 'long' });
  }
}
