import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  selectedRole: 'Customer' | 'Technician' | 'Admin' = 'Customer';
  loading = false;
  errorMsg = '';

  // Validation errors
  emailError = '';
  passwordError = '';

  constructor(
    private router: Router,
    private authService: Auth,
  ) {}

  selectRole(role: 'Customer' | 'Technician' | 'Admin') {
    this.selectedRole = role;
  }

  validate(): boolean {
    this.emailError = '';
    this.passwordError = '';
    let valid = true;

    if (!this.email) {
      this.emailError = 'البريد الإلكتروني مطلوب';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'صيغة البريد الإلكتروني غير صحيحة';
      valid = false;
    }

    if (!this.password) {
      this.passwordError = 'كلمة المرور مطلوبة';
      valid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      valid = false;
    }

    return valid;
  }

  onLogin() {
    if (!this.validate()) return;

    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.email, this.password, this.selectedRole).subscribe({
      next: (res) => {
        this.loading = false;

        this.authService.saveToken(
          res.token,
          this.selectedRole,
          res.refreshToken,
          res.userName ?? res.name ?? this.email.split('@')[0],
        );
        this.redirectByRole(this.selectedRole);
      },

      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      },
    });
  }

  private redirectByRole(role: 'Customer' | 'Technician' | 'Admin') {
    switch (role) {
      case 'Customer':
        this.router.navigate(['/customer/profile']);
        break;
      case 'Technician':
        this.router.navigate(['/technician/profile']);
        break;
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
    }
  }
}