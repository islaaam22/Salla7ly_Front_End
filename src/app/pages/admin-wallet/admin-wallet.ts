import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminWalletService, AdminWalletStatsDto, ApiResponse } from '../../services/admin-wallet-service';

@Component({
  selector: 'app-admin-wallet',
  imports: [CommonModule],
  templateUrl: './admin-wallet.html',
  styleUrl: './admin-wallet.css',
})
export class AdminWallet implements OnInit {
  stats: AdminWalletStatsDto = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingBalance: 0,
  };
  loading = false;
  errorMsg: string | null = null;

  constructor(private adminWalletService: AdminWalletService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.errorMsg = null;
    this.adminWalletService.getWalletStats().subscribe({
      next: (res: ApiResponse<AdminWalletStatsDto>) => {
        this.loading = false;
        if (res.success && res.data) {
          this.stats = res.data;
        } else {
          this.errorMsg = res.message || 'تعذر تحميل إحصائيات المحفظة';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'تعذر الاتصال بالخادم';
      },
    });
  }
}
