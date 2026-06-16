import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer-service';
import { CustomerProfileDetails } from '../../models/customer-model';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-edit.html'
})
export class CustomerEdit implements OnInit {
  // form fields
  name = '';
  phoneNumber = '';
  mainAddress = '';

  // sidebar preview
  email = '';
  customerId = 0;

  loading = true;
  saving = false;
  successMsg = '';
  validationErrors: string[] = [];

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // load current profile to pre-fill the form
    this.customerService.getMyProfile().subscribe({
      next: (data: CustomerProfileDetails) => {
        this.customerId = data.id;
        this.name = data.name;
        this.phoneNumber = data.phoneNumber;
        this.email = data.email;
        this.mainAddress = data.mainAddress;
        this.loading = false;
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

  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.validationErrors = [];

    this.customerService.updateProfile(this.customerId, {
      name: this.name,
      phoneNumber: this.phoneNumber,
      mainAddress: this.mainAddress
    }).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'تم تحديث البيانات بنجاح';
      },
      error: (err) => {
        this.saving = false;

        // ASP.NET [ApiController] returns validation errors in err.error.errors
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
}
