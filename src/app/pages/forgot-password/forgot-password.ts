import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = '';
  loading = false;
  errorMsg = '';
  successMsg = '';
  emailError = '';

  constructor(private router: Router, private authService: Auth) {}

  validate(): boolean {
    this.emailError = '';
    if (!this.email) {
      this.emailError = 'البريد الإلكتروني مطلوب';
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'صيغة البريد الإلكتروني غير صحيحة';
      return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.validate()) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'تم إرسال رمز التحقق إلى بريدك الإلكتروني';
        sessionStorage.setItem('reset_email', this.email);
        setTimeout(() => this.router.navigate(['/verify-otp']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }
}