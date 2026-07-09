import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WalletService, WalletDto, ApiResponse, WalletTransactionDto } from '../../services/wallet-service';

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
  providers: [DatePipe],
})
export class Wallet implements OnInit {
  balance = 0;
  showTopUpModal = false;
  topUpAmount: number | null = null;
  quickAmounts = [50, 100, 200, 500];
  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  transactions: Transaction[] = [];

  constructor(
    private walletService: WalletService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const payment = this.route.snapshot.queryParamMap.get('payment');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (payment === 'success') {
      this.successMsg = 'تمت عملية الشحن بنجاح';
    } else if (payment === 'cancel') {
      this.errorMsg = 'تم إلغاء عملية الشحن';
    }

    if (sessionId) {
      this.confirmPayment(sessionId);
    }

    this.loadWallet();
  }

  confirmPayment(sessionId: string): void {
    this.loading = true;
    this.walletService.confirmTopUp(sessionId).subscribe({
      next: (res: ApiResponse<{ message?: string }>) => {
        this.loading = false;
        if (res.success) {
          this.successMsg = res.message || 'تم شحن المحفظة بنجاح';
          this.loadWallet();
        } else {
          this.errorMsg = res.message || 'تعذر تأكيد عملية الشحن';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'تعذر الاتصال بالخادم لتأكيد الشحن';
      },
    });
  }

  loadWallet(): void {
    this.loading = true;
    this.errorMsg = null;
    this.walletService.getWallet().subscribe({
      next: (res: ApiResponse<WalletDto>) => {
        this.loading = false;
        if (res.success && res.data) {
          this.balance = Number(res.data.balance || 0);
          this.transactions = (res.data.transactions || []).map((tx: WalletTransactionDto) => ({
            title: tx.description || 'معاملة',
            date: this.formatDate(tx.createdAt),
            amount: Math.abs(Number(tx.amount || 0)),
            type: Number(tx.amount || 0) >= 0 ? 'in' : 'out',
          }));
        } else {
          this.errorMsg = res.message || 'تعذر تحميل المحفظة';
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

  openTopUpModal(): void {
    this.showTopUpModal = true;
    this.topUpAmount = null;
    this.errorMsg = null;
    this.successMsg = null;
  }

  openPaymentMethods(): void {
    this.errorMsg = 'سيتم دعم طرق الدفع المتقدمة قريبًا. حالياً يمكن إتمام الشحن عبر البطاقة الافتراضية من الخادم.';
    this.successMsg = null;
  }

  closeTopUpModal(): void {
    this.showTopUpModal = false;
    this.topUpAmount = null;
    this.errorMsg = null;
    this.successMsg = null;
  }

  async confirmTopUp(): Promise<void> {
    if (!this.topUpAmount || this.topUpAmount <= 0) return;

    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.walletService.topUp(this.topUpAmount).subscribe({
      next: (res: ApiResponse<{ checkoutUrl?: string; sessionId?: string; clientSecret?: string; amount?: number }>) => {
        this.loading = false;
        if (res.success && res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          this.errorMsg = res.message || 'تعذر إتمام عملية الشحن';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'تعذر الاتصال بالخادم أو لا توجد طريقة دفع متاحة حاليًا';
      },
    });
  }
}
