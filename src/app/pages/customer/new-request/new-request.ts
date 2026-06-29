import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';
import { AiService } from '../../../services/ai.service';
import { AddressService } from '../../../services/address-service';
import { CustomerAddress } from '../../../models/Address-model';

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
  selectedUrgency: number = 0;

  categories: any[] = [];
  selectedFiles: File[] = [];

  // ── Address ──────────────────────────────────────────────────────
  addresses: CustomerAddress[] = [];
  uniqueAddresses: CustomerAddress[] = [];
  addressesLoading = false;
  addressesError   = false;
  selectedAddressId: number | null = null;

  urgencyLevels = [
    { value: 0, label: 'عادي', desc: 'خلال ٢٤-٤٨ ساعة',              icon: 'fa-solid fa-clock',                color: '#1AACDC' },
    { value: 1, label: 'عاجل', desc: 'خلال بضع ساعات',               icon: 'fa-solid fa-triangle-exclamation', color: '#F59E0B' },
    { value: 2, label: 'طارئ', desc: 'فوراً — يدخل المزايدة مباشرة', icon: 'fa-solid fa-fire',                 color: '#EF4444' },
  ];

  form = {
    title: '',
    description: '',
    urgency: 0,
    bookingMode: 0,
    isEmergency: false,
    scheduledAt: '',
    categoryId: 0,
    serviceAddress: '',
    city: '',
    district: ''
  };

  // ── AI State ─────────────────────────────────────────────────────
  aiActive          = false;
  aiLoading         = false;
  aiError           = '';
  aiQuestionIndex   = 0;
  aiCurrentQuestion = '';
  aiCurrentAnswer   = '';
  aiAnswers: string[] = [];
  aiRefinedDescription = '';
  aiDone            = false;
  readonly AI_TOTAL_QUESTIONS = 3;

  constructor(
    private requestService: RequestService,
    private aiService:      AiService,
    private addressService: AddressService,
    private router:         Router
  ) {}

  ngOnInit() {
    this.requestService.getCategories().subscribe({
      next: (res) => {
        this.categories = res
          .filter((c: any) => c.parentCategoryId === null)
          .map((c: any) => ({ ...c, icon: this.getIconByName(c.nameAr) }));
      }
    });

    this.loadAddresses();
  }

  // ── Address Loading ───────────────────────────────────────────────
 loadAddresses() {
  this.addressesLoading = true;
  this.addressesError = false;

  this.addressService.getMyAddresses().subscribe({
    next: (list) => {

      this.addresses = list;

      // إزالة العناوين المكررة
      const seen = new Set<string>();

      this.uniqueAddresses = list.filter(addr => {
        const key = `${addr.addressDetails}-${addr.city}-${addr.district}`.trim();

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });

      this.addressesLoading = false;

      const def =
        this.uniqueAddresses.find(a => a.isDefault) ??
        this.uniqueAddresses[0];

      if (def) {
        this.selectAddress(def);
      }
    },
    error: () => {
      this.addressesLoading = false;
      this.addressesError = true;
    }
  });
}

  selectAddress(addr: CustomerAddress) {
    this.selectedAddressId    = addr.id;
    this.form.serviceAddress  = addr.addressDetails;
    this.form.city            = addr.city    ?? '';
    this.form.district        = addr.district ?? '';
  }

onAddressChange(value: any) {

  if (value === 'new') {
    this.router.navigate(['/customer/edit']);
    return;
  }

  const addr = this.addresses.find(a => a.id == value);

  if (addr) {
    this.selectAddress(addr);
  }
}

  addressLabel(addr: CustomerAddress): string {
    const parts = [addr.addressDetails, addr.district, addr.city].filter(Boolean);
    return parts.join('، ');
  }

  // ── Icons ────────────────────────────────────────────────────────
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

  getWordCount(): number        { return this.form.description.trim().split(/\s+/).filter(w => w).length; }
  isDescriptionValid(): boolean { return this.getWordCount() >= 5; }

  nextStep() {
    this.submitted = true;
    this.errorMsg  = '';

    if (this.currentStep === 1 && !this.selectedCategory) {
      this.errorMsg = 'يرجى اختيار نوع الخدمة';
      return;
    }

    if (this.currentStep === 2) {
      if (!this.form.title.trim())         { this.errorMsg = 'يرجى إدخال عنوان الطلب'; return; }
      if (!this.isDescriptionValid())       { this.errorMsg = 'يرجى إدخال وصف لا يقل عن ٥ كلمات'; return; }
      if (!this.selectedAddressId)          { this.errorMsg = 'يرجى اختيار عنوان الخدمة'; return; }
      if (!this.form.scheduledAt)           { this.errorMsg = 'يرجى تحديد التاريخ'; return; }
    }

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

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  // ── AI Methods ───────────────────────────────────────────────────
  get selectedCategoryName(): string {
    const cat = this.categories.find(c => c.id === this.selectedCategory);
    return cat?.nameAr || cat?.name || '';
  }

  onImproveWithAI() {
    this.aiError = '';
    if (!this.form.description.trim()) {
      this.aiError = 'يرجى إدخال وصف تفصيلي أولاً قبل استخدام الذكاء الاصطناعي';
      return;
    }
    this.aiActive = true;
    this.aiAnswers = [];
    this.aiQuestionIndex = 0;
    this.aiCurrentQuestion = '';
    this.aiCurrentAnswer = '';
    this.aiRefinedDescription = '';
    this.aiDone = false;
    this.fetchNextQuestion();
  }

  fetchNextQuestion() {
    this.aiLoading = true;
    this.aiError   = '';
    this.aiService.askFollowup(this.form.description, this.aiAnswers, []).subscribe({
      next: (res) => { this.aiLoading = false; this.aiCurrentQuestion = res.question; this.aiCurrentAnswer = ''; },
      error: (err: any) => { this.aiLoading = false; this.aiError = err.error?.message || 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي'; }
    });
  }

  onNextQuestion() {
    if (!this.aiCurrentAnswer.trim()) { this.aiError = 'يرجى إدخال إجابة قبل المتابعة'; return; }
    this.aiError   = '';
    this.aiAnswers = [...this.aiAnswers, this.aiCurrentAnswer.trim()];
    this.aiQuestionIndex++;
    if (this.aiQuestionIndex >= this.AI_TOTAL_QUESTIONS) { this.callRefine(); } else { this.fetchNextQuestion(); }
  }

  callRefine() {
    this.aiLoading = true;
    this.aiError   = '';
    this.aiService.refineRequest(this.form.description, this.selectedCategoryName, [], this.aiAnswers).subscribe({
      next: (res) => {
        this.aiLoading = false;
        this.aiDone    = true;
        this.aiRefinedDescription =
          (res as any).refinedDescription || (res as any).result ||
          (res as any).description        || (res as any).improvedDescription ||
          JSON.stringify(res);
      },
      error: (err: any) => { this.aiLoading = false; this.aiError = err.error?.message || 'حدث خطأ أثناء تحسين الوصف'; }
    });
  }

  useAiDescription() { this.form.description = this.aiRefinedDescription; }

  cancelAI() {
    this.aiActive = false; this.aiDone = false; this.aiAnswers = [];
    this.aiCurrentQuestion = ''; this.aiCurrentAnswer = '';
    this.aiRefinedDescription = ''; this.aiError = '';
  }

  // ── Submit ───────────────────────────────────────────────────────
  submitRequest() {
    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/login']); return; }

    if (!this.selectedAddressId) {
      this.errorMsg = 'يرجى اختيار عنوان الخدمة';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    const formData = new FormData();
    formData.append('Title',          this.form.title);
    formData.append('Description',    this.form.description);
    formData.append('Urgency',        this.selectedUrgency.toString());
    formData.append('BookingMode',    this.form.bookingMode.toString());
    formData.append('IsEmergency',    this.form.isEmergency.toString());
    formData.append('CategoryId',     this.form.categoryId.toString());
    formData.append('AddressId',      this.selectedAddressId.toString());
    formData.append('ScheduledAt',    new Date(this.form.scheduledAt).toISOString());
    formData.append('ServiceAddress', this.form.serviceAddress);
    formData.append('City',           this.form.city);
    formData.append('District',       this.form.district);
    this.selectedFiles.forEach(file => formData.append('Images', file));

    this.requestService.createRequest(formData).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'تم إرسال الطلب بنجاح!';
        setTimeout(() => this.router.navigate(['/customer/my-requests']), 2000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || err.error?.title || 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى';
      }
    });
  }
}
