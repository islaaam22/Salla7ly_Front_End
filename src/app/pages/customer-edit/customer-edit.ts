import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer-service';
import { AddressService } from '../../services/address-service';
import { CustomerProfileDetails } from '../../models/customer-model';
import { CustomerAddress, CreateAddressDto, UpdateAddressDto } from '../../models/Address-model';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-edit.html',
  styleUrl: './customer-edit.css'
})
export class CustomerEdit implements OnInit {
  // form fields
  name = '';
  phoneNumber = '';
  mainAddress = '';

  // sidebar preview
  email = '';
  customerId = 0;

  // ── Photo Upload ──────────────────────────────────────────────
  photoPreview: string | null = null;
  selectedPhotoFile: File | null = null;

  loading = true;
  saving = false;
  successMsg = '';
  validationErrors: string[] = [];

  // ── Address book ──────────────────────────────────────────────
  addresses: CustomerAddress[] = [];
  addressesLoading = false;
  addressesError = '';

  showAddressForm = false;
  editingAddressId: number | null = null;
  addressSaving = false;
  addressForm = {
    title: '',
    street: '',
    city: '',
    district: '',
    isDefault: false
  };

  constructor(
    private customerService: CustomerService,
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerService.getMyProfile().subscribe({
      next: (data: CustomerProfileDetails) => {
        this.customerId = data.id;
        this.name = data.name;
        this.phoneNumber = data.phoneNumber;
        this.email = data.email;
        this.mainAddress = data.mainAddress;
        // load existing photo if available
        if (data.imageUrl) {
          this.photoPreview = data.imageUrl;
        }
        this.loading = false;
        this.loadAddresses();
      },
      error: () => {
        this.validationErrors = ['تعذّر تحميل البيانات. حاول مرة أخرى.'];
        this.loading = false;
      }
    });
  }

  get initial(): string {
    return this.name?.charAt(0)?.toUpperCase() ?? '?';
  }

  // ── Photo handlers ────────────────────────────────────────────
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      this.validationErrors = ['حجم الصورة يجب أن لا يتجاوز 2MB.'];
      return;
    }

    this.selectedPhotoFile = file;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.selectedPhotoFile = null;
    this.photoPreview = null;
    // Reset the input
    const input = document.getElementById('photoInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  // ── Save profile ──────────────────────────────────────────────
  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.validationErrors = [];

    // If a new photo was selected, upload it first then update profile
    // TODO: replace with your actual image upload API call
    // Example: this.customerService.uploadPhoto(this.selectedPhotoFile).subscribe(...)
    // For now, update profile data only
    this.customerService.updateProfile(this.customerId, {
      name: this.name,
      phoneNumber: this.phoneNumber,
      mainAddress: this.mainAddress
    }).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'تم تحديث البيانات بنجاح';
        setTimeout(() => this.goBack(), 900);
      },
      error: (err) => {
        this.saving = false;
        if (err.error?.errors) {
          this.validationErrors = Object.values(err.error.errors).flat() as string[];
        } else if (err.error?.message) {
          this.validationErrors = [err.error.message];
        } else {
          this.validationErrors = ['حدث خطأ. حاول مرة أخرى.'];
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/customer/profile']);
  }

  // ── Address book ──────────────────────────────────────────────
  loadAddresses(): void {
    this.addressesLoading = true;
    this.addressesError = '';
    this.addressService.getMyAddresses().subscribe({
      next: (list) => {
        this.addresses = list ?? [];
        this.addressesLoading = false;
      },
      error: () => {
        this.addressesLoading = false;
        this.addressesError = 'تعذّر تحميل العناوين. حاول مرة أخرى.';
      }
    });
  }

  openAddForm(): void {
    this.editingAddressId = null;
    this.addressForm = { title: '', street: '', city: '', district: '', isDefault: false };
    this.showAddressForm = true;
  }

  openEditForm(addr: CustomerAddress): void {
    this.editingAddressId = addr.id;
    this.addressForm = {
      title: addr.title ?? '',
      street: addr.street ?? '',
      city: addr.city ?? '',
      district: addr.district ?? '',
      isDefault: !!addr.isDefault
    };
    this.showAddressForm = true;
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
  }

  saveAddress(): void {
    if (!this.addressForm.title || !this.addressForm.street || !this.addressForm.city) {
      this.addressesError = 'رجاءً أدخل العنوان والشارع والمدينة.';
      return;
    }
    this.addressSaving = true;
    this.addressesError = '';

    if (this.editingAddressId) {
      const dto: UpdateAddressDto = {
        title: this.addressForm.title,
        street: this.addressForm.street,
        city: this.addressForm.city,
        district: this.addressForm.district || undefined
      };
      this.addressService.updateAddress(this.editingAddressId, dto).subscribe({
        next: () => this.onAddressSaved(),
        error: (err) => this.onAddressSaveError(err)
      });
    } else {
      const dto: CreateAddressDto = {
        customerId: this.customerId,
        title: this.addressForm.title,
        street: this.addressForm.street,
        city: this.addressForm.city,
        district: this.addressForm.district || undefined,
        isDefault: this.addressForm.isDefault
      };
      this.addressService.createAddress(dto).subscribe({
        next: () => this.onAddressSaved(),
        error: (err) => this.onAddressSaveError(err)
      });
    }
  }

  private onAddressSaved(): void {
    this.addressSaving = false;
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.loadAddresses();
  }

  private onAddressSaveError(err: any): void {
    console.error('Address save failed:', err);
    this.addressSaving = false;
    this.addressesError = 'تعذّر حفظ العنوان. حاول مرة أخرى.';
    this.loadAddresses();
  }

  deleteAddress(addr: CustomerAddress): void {
    if (!confirm('هل تريد حذف هذا العنوان؟')) return;
    this.addressService.deleteAddress(addr.id, this.email).subscribe({
      next: () => this.loadAddresses(),
      error: (err) => {
        console.error('Address delete failed:', err);
        this.addressesError = 'تعذّر حذف العنوان. حاول مرة أخرى.';
        this.loadAddresses();
      }
    });
  }

  makeDefault(addr: CustomerAddress): void {
    if (addr.isDefault) return;
    this.addressService.setDefault(addr.id, this.customerId).subscribe({
      next: (res) => {
        console.log('set-default response:', res);
        this.loadAddresses();
      },
      error: (err) => {
        console.error('Set default failed:', err.status, err.error);
        this.addressesError = 'تعذّر تعيين العنوان الافتراضي. حاول مرة أخرى.';
        this.loadAddresses();
      }
    });
  }
}
