import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-request.html',
  styleUrl: './new-request.css'
})
export class NewRequest implements OnInit {

  currentStep = 1;
  loading     = false;
  errorMsg    = '';
  successMsg  = '';
  submitted   = false;

  selectedCategory: number | null = null;
  selectedUrgency:  number        = 0;
  categories:       any[]         = [];
  selectedFiles:    File[]        = [];

  urgencyLevels = [
    { value: 0, label: 'عادي', desc: 'خلال ٢٤-٤٨ ساعة',              icon: 'fa-solid fa-clock',                color: '#1AACDC' },
    { value: 1, label: 'عاجل', desc: 'خلال بضع ساعات',               icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B' },
    { value: 2, label: 'طارئ', desc: 'فوراً — يدخل المزايدة مباشرة', icon: 'fa-solid fa-fire',                 color: '#EF4444' },
  ];

  form = {
    title:          '',
    description:    '',
    urgency:        0,
    bookingMode:    0,
    isEmergency:    false,
    scheduledAt:    '',
    categoryId:     0,
    // FIX: removed hardcoded addressId: 1
    // The customer types their address here; the backend creates the Address
    // row and links it with the real generated ID.
    serviceAddress: '',
    city:           '',
    district:       '',
  };

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  ngOnInit() {
    this.requestService.getCategories().subscribe({
      next: (res) => {
        this.categories = res
          .filter((c: any) => c.parentCategoryId === null)
          .map((c: any) => ({ ...c, icon: this.getIconByName(c.nameAr) }));
      }
    });
  }

  getIconByName(name: string): string {
    if (name.includes('سباكة'))  return 'fa-solid fa-wrench';
    if (name.includes('كهرباء')) return 'fa-solid fa-bolt';
    if (name.includes('تكييف')) return 'fa-solid fa-snowflake';
    if (name.includes('نجارة')) return 'fa-solid fa-hammer';
    if (name.includes('أجهزة')) return 'fa-solid fa-tv';
    return 'fa-solid fa-tools';
  }

  selectCategory(id: number) {
    this.selectedCategory = id;
    this.form.categoryId  = id;
    this.errorMsg         = '';
  }

  selectUrgency(value: number) {
    this.selectedUrgency  = value;
    this.form.urgency     = value;
    this.form.isEmergency = value === 2;
  }

  getWordCount(): number       { return this.form.description.trim().split(/\s+/).filter(w => w).length; }
  isDescriptionValid(): boolean { return this.getWordCount() >= 5; }

  nextStep() {
    this.submitted = true;
    this.errorMsg  = '';

    if (this.currentStep === 1 && !this.selectedCategory) {
      this.errorMsg = 'يرجى اختيار نوع الخدمة';
      return;
    }

    if (this.currentStep === 2) {
      if (!this.form.title.trim())          { this.errorMsg = 'يرجى إدخال عنوان الطلب';           return; }
      if (!this.isDescriptionValid())        { this.errorMsg = 'يرجى إدخال وصف لا يقل عن ٥ كلمات'; return; }
      if (!this.form.serviceAddress.trim()) { this.errorMsg = 'يرجى إدخال عنوان الخدمة';           return; }
      if (!this.form.scheduledAt)           { this.errorMsg = 'يرجى تحديد التاريخ';                  return; }
    }

    this.submitted = false;
    this.currentStep++;
  }

  prevStep() { this.currentStep--; }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      if (this.selectedFiles.length >= 5) break;
      this.selectedFiles.push(files[i]);
    }
  }

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  // FIX: no longer appends addressId at all.
  // The backend (ServiceRequestService.CreateAsync) detects that AddressId is
  // absent/null, creates a new Address row from serviceAddress/city/district,
  // and links the ServiceRequest to the real generated ID.
  submitRequest() {
    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/login']); return; }

    this.loading  = true;
    this.errorMsg = '';

    const formData = new FormData();
    formData.append('title',          this.form.title);
    formData.append('description',    this.form.description);
    formData.append('urgency',        this.selectedUrgency.toString());
    formData.append('bookingMode',    this.form.bookingMode.toString());
    formData.append('isEmergency',    this.form.isEmergency.toString());
    formData.append('categoryId',     this.form.categoryId.toString());
    formData.append('scheduledAt',    new Date(this.form.scheduledAt).toISOString());
    formData.append('serviceAddress', this.form.serviceAddress);

    if (this.form.city)     formData.append('city',     this.form.city);
    if (this.form.district) formData.append('district', this.form.district);

    // NOTE: addressId intentionally NOT sent — backend will create and link it.

    this.selectedFiles.forEach(file => formData.append('images', file));

    this.requestService.createRequest(formData).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'تم إرسال الطلب بنجاح!';
        setTimeout(() => this.router.navigate(['/customer/my-requests']), 2000);
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'حدث خطأ أثناء الإرسال';
      }
    });
  }
}
