import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";

@Component({
  selector: 'app-register',
  imports: [RouterLink,  FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {
  selectedRole: string = 'customer';

selectRole(role: string) {
  this.selectedRole = role;
}
loading = false;
name: string = '';
email: string = '';
password: string = '';
errorMsg: string = '';
nameError: string = '';
emailError: string = '';
passwordError: string = '';

constructor(private router: Router, private authService: Auth) {}

validate(): boolean {
  this.nameError = '';
  this.emailError = '';
  this.passwordError = '';
  let valid = true;
  if (!this.name) {
    this.nameError = 'الاسم الكامل مطلوب';
    valid = false;
  }
  else if (this.name.length < 3) {
    this.nameError = 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل';
    valid = false;
  }
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
        this.authService.saveToken(res.token, this.selectedRole);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      }
    });
  }
}
