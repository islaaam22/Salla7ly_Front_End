import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify-otp',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp implements OnInit, OnDestroy {
  otpDigits: string[] = ['', '', '', '', '', ''];
  email = '';
  loading = false;
  errorMsg = '';
  otpError = '';

  resendLoading = false;
  resendCooldown = 0;
  private cooldownTimer: any;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(private router: Router, private authService: Auth) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('reset_email') || '';
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  ngOnDestroy() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  get otpCode(): string {
    return this.otpDigits.join('');
  }

  onOtpInput(event: any, index: number) {
    const val = event.target.value.replace(/\D/g, '');
    this.otpDigits[index] = val ? val[val.length - 1] : '';
    event.target.value = this.otpDigits[index];

    if (this.otpDigits[index] && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const inputs = this.otpInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => { this.otpDigits[i] = d; });
  }

  validate(): boolean {
    this.otpError = '';
    if (this.otpCode.length < 6) {
      this.otpError = 'يرجى إدخال الرمز كاملاً (6 أرقام)';
      return false;
    }
    return true;
  }

  onVerify() {
    if (!this.validate()) return;

    this.loading = true;
    this.errorMsg = '';

    this.authService.verifyOtp(this.email, this.otpCode).subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.setItem('otp_verified', 'true');
        sessionStorage.setItem('otp_code', this.otpCode);
        this.router.navigate(['/reset-password']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'الرمز غير صحيح أو منتهي الصلاحية';
      }
    });
  }

  onResend() {
    this.resendLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.resendLoading = false;
        this.startCooldown();
      },
      error: () => {
        this.resendLoading = false;
      }
    });
  }

  startCooldown() {
    this.resendCooldown = 60;
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(this.cooldownTimer);
    }, 1000);
  }
}