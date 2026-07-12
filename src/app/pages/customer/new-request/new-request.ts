import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';
import { AiService } from '../../../services/ai.service';
import { AddressService } from '../../../services/address-service';
import { CustomerService } from '../../../services/customer-service';
import { CustomerProfileDetails } from '../../../models/customer-model';
import { CustomerAddress, CreateAddressDto, UpdateAddressDto } from '../../../models/Address-model';

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

  // ── Customer Info ────────────────────────────────────────────────
  customerId = 0;
  customerEmail = '';

  // ── Address ──────────────────────────────────────────────────────
  addresses: CustomerAddress[] = [];
  uniqueAddresses: CustomerAddress[] = [];
  addressesLoading = false;
  addressesError   = '';
  selectedAddressId: number | null = null;

  // ── Address Popup State ──────────────────────────────────────────
  showAddressForm   = false;
  addressSaving     = false;
  editingAddressId: number | null = null;
  addressForm = {
    title: '',
    street: '',
    city: '',
    district: '',
    isDefault: false
  };

  urgencyLevels = [
    { value: 0, label: 'عادي', desc: 'خلال ٢-٤٨ ساعة',              icon: 'fa-solid fa-clock',                color: '#1AACDC' },
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

  // ─ AI State ─────────────────────────────────────────────────────
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

  // ── Image Analysis State ───────────────────────────────────────────
  imageAnalyzing      = false;
  imageAnalysisResult: any = null;
  imageAnalysisError  = '';
  showImageAnalysis   = false;
  autoFilledFromImage = false;

  constructor(
    private requestService: RequestService,
    private aiService:      AiService,
    private addressService: AddressService,
    private customerService: CustomerService,
    private router:         Router
  ) {}

  ngOnInit() {
    // نجيب بيانات البروفايل عشان ناخد customerId و email
    this.customerService.getMyProfile().subscribe({
      next: (data: CustomerProfileDetails) => {
        console.log('Customer Profile Loaded:', data);
        this.customerId = data.id;
        this.customerEmail = data.email;
        
        // بعد ما نجيب الـ customerId، نحمل العناوين
        this.loadAddresses();
      },
      error: (err) => {
        console.error('Failed to load customer profile:', err);
        this.addressesError = 'تعذّر تحميل بيانات المستخدم';
      }
    });

    this.requestService.getCategories().subscribe({
      next: (res) => {
        this.categories = res
          .filter((c: any) => c.parentCategoryId === null)
          .map((c: any) => ({ ...c, icon: this.getIconByName(c.nameAr) }));
      }
    });
  }

  // ── Address Loading ───────────────────────────────────────────────
  loadAddresses() {
    console.log('Loading addresses... customerId:', this.customerId);
    this.addressesLoading = true;
    this.addressesError   = '';

    this.addressService.getMyAddresses().subscribe({
      next: (list) => {
        console.log('Addresses loaded:', list);
        this.addresses = list ?? [];

        const seen = new Set<string>();
        this.uniqueAddresses = this.addresses.filter(addr => {
          const key = `${addr.street}-${addr.city}-${addr.district}`.trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        this.addressesLoading = false;

        // لو مفيش عنوان مختار حالياً، نختار الافتراضي أو الأول
        if (!this.selectedAddressId && this.uniqueAddresses.length > 0) {
          const def =
            this.uniqueAddresses.find(a => a.isDefault) ??
            this.uniqueAddresses[0];
          if (def) this.selectAddress(def);
        } else {
          // لو العنوان المختار اتشال، نختار بديل
          const stillExists = this.uniqueAddresses.find(a => a.id === this.selectedAddressId);
          if (!stillExists && this.uniqueAddresses.length > 0) {
            const fallback =
              this.uniqueAddresses.find(a => a.isDefault) ??
              this.uniqueAddresses[0];
            if (fallback) this.selectAddress(fallback);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load addresses:', err);
        this.addressesLoading = false;
        this.addressesError   = 'تعذّر تحميل العناوين.';
      }
    });
  }

  selectAddress(addr: CustomerAddress) {
    console.log('Address selected:', addr);
    this.selectedAddressId    = addr.id;
    this.form.serviceAddress  = addr.street    ?? '';
    this.form.city            = addr.city      ?? '';
    this.form.district        = addr.district  ?? '';
  }

  // 🔻 تعديل: بدل ما يروح لصفحة تانية، بيفتح الـ popup
  onAddressChange(value: any) {
    console.log('Address change triggered, value:', value);
    if (value === 'new') {
      this.openNewAddressForm();
      return;
    }

    const addr = this.addresses.find(a => a.id == value);
    if (addr) this.selectAddress(addr);
  }

  addressLabel(addr: CustomerAddress): string {
    const parts = [addr.title, addr.street, addr.district, addr.city].filter(Boolean);
    return parts.join('، ');
  }

  // ── Address Popup Methods ────────────────────────────────────────
  openNewAddressForm() {
    console.log('Opening new address form');
    this.editingAddressId = null;
    this.addressForm = {
      title: '',
      street: '',
      city: '',
      district: '',
      isDefault: false
    };
    this.addressesError = '';
    this.showAddressForm = true;
  }

  openEditForm(addr: CustomerAddress) {
    console.log('Opening edit form for address:', addr);
    this.editingAddressId = addr.id;
    this.addressForm = {
      title:    addr.title    ?? '',
      street:   addr.street   ?? '',
      city:     addr.city     ?? '',
      district: addr.district ?? '',
      isDefault: !!addr.isDefault
    };
    this.addressesError = '';
    this.showAddressForm = true;
  }

  cancelAddressForm() {
    console.log('Cancelling address form');
    this.showAddressForm   = false;
    this.editingAddressId  = null;
    this.addressesError    = '';
    this.addressForm = { title: '', street: '', city: '', district: '', isDefault: false };

    // نرجع الـ dropdown على أول قيمة صالحة
    if (this.selectedAddressId === null && this.uniqueAddresses.length > 0) {
      const fallback =
        this.uniqueAddresses.find(a => a.isDefault) ??
        this.uniqueAddresses[0];
      if (fallback) this.selectAddress(fallback);
    }
  }

  saveAddress() {
    console.log('Save address clicked');
    console.log('Current customerId:', this.customerId);
    console.log('Form data:', this.addressForm);
    console.log('Editing address ID:', this.editingAddressId);

    if (!this.addressForm.title || !this.addressForm.title.trim()) {
      this.addressesError = 'رجاءً أدخل اسم العنوان.';
      return;
    }
    if (!this.addressForm.street || !this.addressForm.street.trim()) {
      this.addressesError = 'رجاءً أدخل الشارع.';
      return;
    }
    if (!this.addressForm.city || !this.addressForm.city.trim()) {
      this.addressesError = 'رجاءً أدخل المدينة.';
      return;
    }

    this.addressSaving = true;
    this.addressesError = '';

    if (this.editingAddressId) {
      console.log('Updating existing address...');
      const dto: UpdateAddressDto = {
        title: this.addressForm.title.trim(),
        street: this.addressForm.street.trim(),
        city: this.addressForm.city.trim(),
        district: this.addressForm.district?.trim() || undefined
      };
      
      console.log('Update DTO:', dto);
      
      this.addressService.updateAddress(this.editingAddressId, dto).subscribe({
        next: (res) => {
          console.log('Address updated successfully:', res);
          this.onAddressSaved();
        },
        error: (err) => {
          console.error('Address update failed:', err);
          this.onAddressSaveError(err);
        }
      });
    } else {
      console.log('Creating new address...');
      
      if (!this.customerId) {
        console.error('customerId is not set!');
        this.addressesError = 'خطأ: لم يتم تحميل بيانات المستخدم. يرجى إعادة المحاولة.';
        this.addressSaving = false;
        return;
      }

      const dto: CreateAddressDto = {
        customerId: this.customerId,
        title: this.addressForm.title.trim(),
        street: this.addressForm.street.trim(),
        city: this.addressForm.city.trim(),
        district: this.addressForm.district?.trim() || undefined,
        isDefault: this.addressForm.isDefault
      };
      
      console.log('Create DTO:', dto);
      
      this.addressService.createAddress(dto).subscribe({
        next: (res) => {
          console.log('Address created successfully:', res);
          this.onAddressSaved();
        },
        error: (err) => {
          console.error('Address creation failed:', err);
          this.onAddressSaveError(err);
        }
      });
    }
  }

  private onAddressSaved(): void {
    console.log('Address saved successfully');
    this.addressSaving = false;
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressForm = { title: '', street: '', city: '', district: '', isDefault: false };
    
    // إعادة تحميل العناوين
    this.loadAddresses();
    
    // بعد ما نحمل العناوين، نختار أحدث واحد لو كان إضافة جديدة
    setTimeout(() => {
      if (!this.editingAddressId && this.uniqueAddresses.length > 0) {
        const latest = this.uniqueAddresses[this.uniqueAddresses.length - 1];
        this.selectAddress(latest);
      }
    }, 400);
  }

  private onAddressSaveError(err: any): void {
    console.error('Address save failed:', err);
    this.addressSaving = false;
    
    if (err.error?.message) {
      this.addressesError = err.error.message;
    } else if (err.error?.title) {
      this.addressesError = err.error.title;
    } else {
      this.addressesError = 'تعذّر حفظ العنوان. حاول مرة أخرى.';
    }
    
    this.loadAddresses();
  }

  makeDefault(addr: CustomerAddress): void {
    if (addr.isDefault) return;
    
    console.log('Setting address as default:', addr.id);
    
    this.addressService.setDefault(addr.id, this.customerId).subscribe({
      next: (res) => {
        console.log('Set default response:', res);
        this.loadAddresses();
        this.selectAddress(addr);
      },
      error: (err) => {
        console.error('Set default failed:', err.status, err.error);
        this.addressesError = 'تعذّر تعيين العنوان الافتراضي. حاول مرة أخرى.';
        this.loadAddresses();
      }
    });
  }

  deleteAddress(addr: CustomerAddress): void {
    if (!confirm('هل تريد حذف هذا العنوان؟')) return;
    
    console.log('Deleting address:', addr.id);
    
    this.addressService.deleteAddress(addr.id, this.customerEmail).subscribe({
      next: () => {
        console.log('Address deleted successfully');
        this.loadAddresses();
      },
      error: (err) => {
        console.error('Address delete failed:', err);
        this.addressesError = 'تعذّر حذف العنوان. حاول مرة أخرى.';
        this.loadAddresses();
      }
    });
  }

  // ── Icons ────────────────────────────────────────────────────────
  getIconByName(name: string): string {
    if (name.includes('سباكة'))   return 'fa-solid fa-wrench';
    if (name.includes('كهرباء'))  return 'fa-solid fa-bolt';
    if (name.includes('تكييف'))   return 'fa-solid fa-snowflake';
    if (name.includes('نجارة'))   return 'fa-solid fa-hammer';
    if (name.includes('أجهزة'))   return 'fa-solid fa-tv';
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

  // ── Image Analysis Methods ───────────────────────────────────────────
  onAnalyzeImages() {
    if (this.selectedFiles.length === 0) {
      this.imageAnalysisError = 'يرجى اختيار صورة واحدة على الأقل للتحليل';
      return;
    }

    this.imageAnalyzing = true;
    this.imageAnalysisError = '';

    this.aiService.analyzeImageUpload(this.selectedFiles[0]).subscribe({
      next: (result) => {
        this.imageAnalyzing = false;
        this.imageAnalysisResult = result;
        this.showImageAnalysis = true;

        if (result.suggestedDescription && !this.autoFilledFromImage) {
          this.form.description = result.suggestedDescription;
          this.autoFilledFromImage = true;
        }

        if (result.category) {
          const matchedCategory = this.categories.find(c =>
            c.nameAr.includes(result.category) || result.category.includes(c.nameAr)
          );
          if (matchedCategory) {
            this.selectCategory(matchedCategory.id);
          }
        }
      },
      error: (err) => {
        this.imageAnalyzing = false;
        this.imageAnalysisError = err.error?.message || 'فشل تحليل الصورة';
      }
    });
  }

  useImageAnalysisSuggestions() {
    if (this.imageAnalysisResult?.suggestedDescription) {
      this.form.description = this.imageAnalysisResult.suggestedDescription;
      this.autoFilledFromImage = true;
    }
    this.showImageAnalysis = false;
  }

  closeImageAnalysis() {
    this.showImageAnalysis = false;
  }

  getImageAnalysisSeverity(): string {
    const severity = this.imageAnalysisResult?.severity?.toLowerCase();
    switch (severity) {
      case 'high':   return 'bg-danger text-white';
      case 'medium': return 'bg-warning text-dark';
      case 'low':    return 'bg-success text-white';
      default:       return 'bg-secondary text-white';
    }
  }

  getImageAnalysisSeverityLabel(): string {
    const severity = this.imageAnalysisResult?.severity?.toLowerCase();
    switch (severity) {
      case 'high':   return 'شديدة';
      case 'medium': return 'متوسطة';
      case 'low':    return 'خفيفة';
      default:       return 'غير محدد';
    }
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