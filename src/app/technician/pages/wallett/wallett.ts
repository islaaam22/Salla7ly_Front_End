import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WalletService, WalletDto, ApiResponse, WalletTransactionDto } from '../../../services/wallet-service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './wallett.html',
  styleUrl: './wallett.css',
  providers: [DatePipe],
})
export class Wallet implements OnInit {
  pendingBalance = 0;
  pendingDays = 0;
  totalWithdrawn = 0;
  availableBalance = 0;
  growthPercent = 0;
  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;
  bankAccount = '';

  withdrawalHistory: WithdrawalRecord[] = [];
  monthlyPerformance: MonthlyPerformance[] = [];

  private rawPerformance: { month: string; amount: number }[] = [];

  constructor(private walletService: WalletService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    this.errorMsg = null;
    this.walletService.getWallet().subscribe({
      next: (res: ApiResponse<WalletDto>) => {
        this.loading = false;
        if (res.success && res.data) {
          this.availableBalance = Number(res.data.balance || 0);
          this.pendingBalance = Number(res.data.pendingBalance || 0);
          this.totalWithdrawn = Number(res.data.totalWithdrawn || 0);
          this.withdrawalHistory = (res.data.transactions || [])
            .filter((tx: WalletTransactionDto) => Number(tx.amount || 0) < 0)
            .map((tx: WalletTransactionDto) => ({
              amount: Math.abs(Number(tx.amount || 0)),
              month: this.formatDate(tx.createdAt),
              statusLabel: 'مكتمل',
              statusClass: 'status-completed',
              statusIcon: 'fa-solid fa-circle-check',
            }));

          this.rawPerformance = (res.data.transactions || [])
            .slice(0, 4)
            .map((tx: WalletTransactionDto, index: number) => ({
              month: this.formatMonth(index),
              amount: Math.abs(Number(tx.amount || 0)),
            }));

          const maxAmount = Math.max(...this.rawPerformance.map((m) => m.amount), 1);
          this.monthlyPerformance = this.rawPerformance.map((m) => ({
            ...m,
            percentHeight: Math.round((m.amount / maxAmount) * 100),
          }));
        } else {
          this.errorMsg = res.message || 'تعذر تحميل بيانات المحفظة';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'تعذر الاتصال بالخادم';
      },
    });
  }

  private formatDate(value?: string): string {
    if (!value) return 'الآن';
    const parsed = new Date(value);
    return this.datePipe.transform(parsed, 'dd/MM/yyyy HH:mm') || value;
  }

  private formatMonth(index: number): string {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[index % months.length];
  }

  withdrawEarnings(): void {
    if (!this.bankAccount.trim()) {
      this.errorMsg = 'يرجى إدخال حساب بنكي أو رقم الحساب';
      return;
    }

    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.walletService.withdraw(this.availableBalance, this.bankAccount).subscribe({
      next: (res: ApiResponse<{ message?: string }>) => {
        this.loading = false;
        if (res.success) {
          this.successMsg = res.message || 'تم طلب السحب بنجاح';
          this.bankAccount = '';
          this.loadWallet();
        } else {
          this.errorMsg = res.message || 'تعذر إتمام عملية السحب';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'تعذر الاتصال بالخادم';
      },
    });
  }
}



