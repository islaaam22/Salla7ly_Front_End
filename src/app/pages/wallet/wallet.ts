import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  WalletService,
  WalletData,
  WalletTransaction,
} from '../../services/wallet-service';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class Wallet implements OnInit {
  constructor(
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // wallet state
  balance = 0;
  pendingBalance = 0;
  totalEarned = 0;
  totalWithdrawn = 0;
  currency = 'EGP';
  transactions: WalletTransaction[] = [];

  isLoading = true;
  loadError = false;

  // top-up modal state
  showTopUpModal = false;
  topUpAmount: number | null = null;
  quickAmounts = [50, 100, 200, 500];
  isSubmittingTopUp = false;
  topUpError = '';

  // shown right after returning from Stripe checkout, before the wallet reloads
  isConfirmingPayment = false;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.confirmReturnFromCheckout(sessionId);
    } else {
      this.loadWallet();
    }
  }

  private loadWallet(): void {
    this.isLoading = true;
    this.loadError = false;

    this.walletService.getWallet().subscribe({
      next: (res) => {
        const data: WalletData | undefined = res?.data;
        this.balance = data?.balance ?? 0;
        this.pendingBalance = data?.pendingBalance ?? 0;
        this.totalEarned = data?.totalEarned ?? 0;
        this.totalWithdrawn = data?.totalWithdrawn ?? 0;
        this.currency = data?.currency || 'EGP';
        this.transactions = this.walletService.extractTransactions(res);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
      },
    });
  }

  /** Called on return from Stripe checkout (URL will have ?session_id=...). */
  private confirmReturnFromCheckout(sessionId: string): void {
    this.isConfirmingPayment = true;
    this.walletService.confirmTopUp(sessionId).subscribe({
      next: () => this.afterCheckoutReturn(),
      error: () => this.afterCheckoutReturn(), // still reload — balance may already be updated by webhook
    });
  }

  private afterCheckoutReturn(): void {
    this.isConfirmingPayment = false;
    // clean the session_id out of the URL, then load the real wallet state
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
    this.loadWallet();
  }

  // ── top-up modal ─────────────────────────────────────────────

  openTopUpModal(): void {
    this.showTopUpModal = true;
    this.topUpAmount = null;
    this.topUpError = '';
  }

  closeTopUpModal(): void {
    if (this.isSubmittingTopUp) return;
    this.showTopUpModal = false;
    this.topUpAmount = null;
    this.topUpError = '';
  }

  confirmTopUp(): void {
    if (!this.topUpAmount || this.topUpAmount <= 0) {
      this.topUpError = 'أدخلي مبلغاً صحيحاً أكبر من صفر';
      return;
    }

    this.isSubmittingTopUp = true;
    this.topUpError = '';

    this.walletService.topUp(this.topUpAmount, 'pm_card_visa').subscribe({
      next: (res) => {
        const checkoutUrl = this.walletService.extractCheckoutUrl(res);
        if (checkoutUrl) {
          // redirect to Stripe's hosted checkout page
          window.location.href = checkoutUrl;
          return;
        }
        // no redirect URL came back — treat as unexpected, but refresh anyway
        this.isSubmittingTopUp = false;
        this.closeTopUpModal();
        this.loadWallet();
      },
      error: () => {
        this.isSubmittingTopUp = false;
        this.topUpError = 'حصل خطأ أثناء الشحن، حاولي تاني';
      },
    });
  }

  // ── display helpers ──────────────────────────────────────────

  isIncoming(tx: WalletTransaction): boolean {
    const t = (tx.type || '').toLowerCase();
    return t === 'deposit' || t === 'refund';
  }

  txTitle(tx: WalletTransaction): string {
    if (tx.description) return tx.description;
    return this.isIncoming(tx) ? 'شحن المحفظة' : 'عملية سحب/دفع';
  }

  txDate(tx: WalletTransaction): string {
    if (!tx.createdOn) return '';
    const d = new Date(tx.createdOn);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
