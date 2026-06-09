import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  errorMsg = '';
  passwordError = '';
  confirmError = '';

  private email = '';
  private otpCode = '';

  constructor(private router: Router, private authService: Auth) {}

  ngOnInit() {
    this.email = sessionStorage.getItem('reset_email') || '';
    this.otpCode = sessionStorage.getItem('otp_code') || '';
    const verified = sessionStorage.getItem('otp_verified');
    if (!verified || !this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  get strengthPercent(): number {
    const p = this.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }

  get strengthColor(): string {
    const s = this.strengthPercent;
    if (s <= 25) return '#e74c3c';
    if (s <= 50) return '#e67e22';
    if (s <= 75) return '#f1c40f';
    return '#27ae60';
  }

  get strengthLabel(): string {
    const s = this.strengthPercent;
    if (s <= 25) return 'ضعيفة جداً';
    if (s <= 50) return 'ضعيفة';
    if (s <= 75) return 'متوسطة';
    return 'قوية';
  }

  validate(): boolean {
    this.passwordError = '';
    this.confirmError = '';
    let valid = true;

    if (!this.password) {
      this.passwordError = 'كلمة المرور مطلوبة';
      valid = false;
    } else if (this.password.length < 8) {
      this.passwordError = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      valid = false;
    }

    if (!this.confirmPassword) {
      this.confirmError = 'يرجى تأكيد كلمة المرور';
      valid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmError = 'كلمتا المرور غير متطابقتين';
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) return;

    this.loading = true;
    this.errorMsg = '';

    this.authService.resetPassword(this.email, this.otpCode, this.password).subscribe({
      next: () => {
        this.loading = false;
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('otp_verified');
        sessionStorage.removeItem('otp_code');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }
}