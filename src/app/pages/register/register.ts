import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";
import { OnInit } from "@angular/core";

@Component({
  selector: 'app-register',
  imports: [RouterLink,  FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit {
  selectedRole: string = 'customer';

  ngOnInit() {
    const role = this.route.snapshot.queryParamMap.get('role');
    if (role === 'tech' || role === 'technician') {
      this.selectedRole = 'tech';
    }
  }

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
phoneNumber = '';
imageUrl = '';
experienceYears = 0;
avgResponseTime = '';
selectedFile: File | null = null;

onFileSelected(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
    // يمكنك هنا رفع الملف إلى الخادم أو معالجته كما تريد
  }
}

constructor(private router: Router, private authService: Auth, private route: ActivatedRoute) {}

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

onRegister() {
  if (!this.validate()) return;

  this.loading = true;
  this.errorMsg = '';

  const formData = new FormData();
  formData.append('name', this.name);
  formData.append('email', this.email);
  formData.append('password', this.password);
  formData.append('phoneNumber', this.phoneNumber);
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }


  // if (this.selectedRole === 'customer') {
  //   const customerData = {
  //     name: this.name,
  //     email: this.email,
  //     password: this.password,
  //     phoneNumber: this.phoneNumber,
  //     imageUrl: this.imageUrl,
  //   };
    this.authService.registerCustomer(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      }
    });

    const formDataTech = new FormData();
    formDataTech.append('name', this.name);
    formDataTech.append('email', this.email);
    formDataTech.append('password', this.password);
    formDataTech.append('phoneNumber', this.phoneNumber);
    formDataTech.append('experienceYears', this.experienceYears.toString());
    formDataTech.append('avgResponseTime', this.avgResponseTime);
    if (this.selectedFile) {
      formDataTech.append('image', this.selectedFile);
    }

  // } else if (this.selectedRole === 'technician') {
  //   const technicianData = {
  //     name: this.name,
  //     email: this.email,
  //     password: this.password,
  //     phoneNumber: this.phoneNumber,
  //     imageUrl: this.imageUrl,
  //     experienceYears: this.experienceYears,
  //     avgResponseTime: this.avgResponseTime
  //   };
    this.authService.registerTechnician(formDataTech).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      }
    });
  }
}

