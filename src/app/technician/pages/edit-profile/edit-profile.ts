import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-technician-edit-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class TechnicianEditProfile implements OnInit {
  loading = true;
  saving = false;
  errorMsg = '';
  successMsg = '';
  avatarLetter = '';

 technicianId = 0;
  fullName = '';
  email = '';
  phoneNumber = '';
  bio = '';
  experienceYears = 0;
  imageUrl = '';



  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  passwordLoading = false;

  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


  loadProfile() {
    this.http.get(`${this.apiUrl}/Technician/mine`, { headers: this.authHeaders() }).subscribe({
      next: (data: any) => {
        this.technicianId = data.id;
        this.fullName = data.name || '';
        this.email = data.email || '';
        this.phoneNumber = data.phoneNumber || '';
        this.bio = data.bio || '';
        this.experienceYears = data.experienceYears || 0;
        this.avatarLetter = (this.fullName || 'F').charAt(0).toUpperCase();
        this.loading = false;
        this.imageUrl = data.imageUrl || '';
      },

      error: () => {
        this.errorMsg = 'تعذّر تحميل البيانات';
        this.loading = false;
      }
    });
  }


 onSaveProfile() {
    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = new FormData();
    formData.append('Name', this.fullName);
    formData.append('PhoneNumber', this.phoneNumber);
    formData.append('Bio', this.bio);
    formData.append('ExperienceYears', this.experienceYears.toString());
    formData.append('AvgResponseTime', '0');
    formData.append('ImageUrl', this.imageUrl || 'https://i.pravatar.cc/150');

    this.http.put(
      `${this.apiUrl}/Technician/${this.technicianId}`,
      formData,
      { headers: this.authHeaders() }
    ).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'تم حفظ التعديلات بنجاح';
        setTimeout(() => this.router.navigate(['/technician/profile']), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err.error?.message || 'حدث خطأ أثناء الحفظ';
      }
    });
  }



  onChangePassword() {
  this.passwordError = '';
  this.passwordSuccess = '';

  if (!this.email || !this.newPassword || !this.confirmPassword) {
    this.passwordError = 'يرجى تعبئة جميع الحقول';
    return;
  }

  if (this.newPassword.length < 8) {
    this.passwordError = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.passwordError = 'كلمتا المرور غير متطابقتين';
    return;
  }

  this.passwordLoading = true;

  const body = {
    email: this.email,
    newPassword: this.newPassword,
    confirmPassword: this.confirmPassword
  };

  this.http.post(
    `${this.apiUrl}/Auth/reset-password`,
    body,
    { headers: this.authHeaders() }
  ).subscribe({
    next: () => {
      this.passwordLoading = false;
      this.passwordSuccess = 'تم تحديث كلمة المرور بنجاح';

      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },
    error: (err: any) => {
      this.passwordLoading = false;
      this.passwordError =
        err.error?.message ||
        err.error?.title ||
        'حدث خطأ أثناء تحديث كلمة المرور';
    }
  });
}

}
