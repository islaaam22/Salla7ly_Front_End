import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';

@Component({
  selector: 'app-new-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './new-request.html',
  styleUrl: './new-request.css'
})
export class NewRequest {
  currentStep = 1;
  loading = false;
  errorMsg = '';
  successMsg = '';
  submitted = false;

  selectedCategory: number | null = null;
  selectedUrgency: number = 0;

  categories = [
    { id: 1, name: 'السباكة', icon: 'fa-solid fa-wrench' },
    { id: 2, name: 'الكهرباء', icon: 'fa-solid fa-bolt' },
    { id: 3, name: 'التكييف', icon: 'fa-solid fa-snowflake' },
    { id: 4, name: 'النجارة', icon: 'fa-solid fa-hammer' },
    { id: 5, name: 'الأجهزة', icon: 'fa-solid fa-tv' },
  ];

  urgencyLevels = [
    { value: 0, label: 'عادي', desc: 'خلال ٢٤-٤٨ ساعة', icon: 'fa-solid fa-clock', color: '#1AACDC' },
    { value: 1, label: 'عاجل', desc: 'خلال بضع ساعات', icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B' },
    { value: 2, label: 'طارئ', desc: 'فوراً — يدخل المزايدة مباشرة', icon: 'fa-solid fa-fire', color: '#EF4444' },
  ];

  form = {
    title: '',
    description: '',
    imageUrls: [] as string[],
    urgency: 0,
    bookingMode: 0,
    isEmergency: false,
    scheduledAt: '',
    addressId: 1,
    categoryId: 0,
    serviceAddress: '',
  };

  constructor(private requestService: RequestService, private router: Router) {}

  selectCategory(id: number) {
    this.selectedCategory = id;
    this.form.categoryId = id;
    this.errorMsg = '';
  }

  selectUrgency(value: number) {
    this.selectedUrgency = value;
    this.form.urgency = value;
    this.form.isEmergency = value === 2;
  }

  getCategoryName(): string {
    return this.categories.find(c => c.id === this.selectedCategory)?.name ?? '';
  }

  getUrgencyLabel(): string {
    return this.urgencyLevels.find(u => u.value === this.selectedUrgency)?.label ?? '';
  }

  getWordCount(): number {
    return this.form.description.trim().split(/\s+/).filter(w => w).length;
  }

  isDescriptionValid(): boolean {
    return this.getWordCount() >= 5;
  }

  nextStep() {
    this.submitted = true;
    this.errorMsg = '';

    if (this.currentStep === 1) {
      if (!this.selectedCategory) {
        this.errorMsg = 'يرجى اختيار نوع الخدمة';
        return;
      }
    }

    if (this.currentStep === 2) {
      if (!this.form.title.trim()) {
        this.errorMsg = 'يرجى إدخال عنوان الطلب';
        return;
      }
      if (!this.isDescriptionValid()) {
        this.errorMsg = 'يرجى إدخال وصف لا يقل عن ٥ كلمات';
        return;
      }
      if (!this.form.serviceAddress.trim()) {
        this.errorMsg = 'يرجى إدخال عنوان الخدمة';
        return;
      }
      if (!this.form.scheduledAt) {
        this.errorMsg = 'يرجى تحديد التاريخ المفضل';
        return;
      }
    }

    this.submitted = false;
    this.currentStep++;
  }

  prevStep() {
    this.errorMsg = '';
    this.submitted = false;
    this.currentStep--;
  }

  submitRequest() {
  this.loading = true;
  this.errorMsg = '';

  const token = localStorage.getItem('token');

  if (!token) {
    this.loading = false;
    this.errorMsg = 'يرجى تسجيل الدخول أولاً';
    this.router.navigate(['/login']);
    return;
  }

  const payload = {
    title: this.form.title,
    description: this.form.description,
    imageUrls: this.form.imageUrls,
    urgency: this.selectedUrgency,
    bookingMode: this.form.bookingMode,
    isEmergency: this.form.isEmergency,
    scheduledAt: new Date(this.form.scheduledAt).toISOString(),
    addressId: this.form.addressId,
    categoryId: this.form.categoryId,
  };

  console.log('Token:', token);
  console.log('Payload:', payload);

  this.requestService.createRequest(payload).subscribe({
    next: (res) => {
      console.log('Success:', res);
      this.loading = false;
      this.successMsg = 'تم إرسال طلبك بنجاح!';
      setTimeout(() => this.router.navigate(['/customer/my-requests']), 2000);
    },
    error: (err) => {
      console.log('Error status:', err.status);
      console.log('Error:', err);
      this.loading = false;
      if (err.status === 401) {
        this.errorMsg = 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى';
        this.router.navigate(['/login']);
      } else {
        this.errorMsg = err?.error?.message ?? 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    }
  });
}
}
