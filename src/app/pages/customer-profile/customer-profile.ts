import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer-service';
import { AddressService } from '../../services/address-service';
import { CustomerProfileDetails } from '../../models/customer-model';
import { CustomerAddress } from '../../models/Address-model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.css'
})
export class CustomerProfile implements OnInit {
  customer?: CustomerProfileDetails;
  loading = true;
  error = false;

  // Full address book, shown on the profile page so nothing added there gets "lost".
  addresses: CustomerAddress[] = [];
  addressesLoading = false;

  constructor(
    private customerService: CustomerService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.loadMyProfile();
    this.loadAddresses();
  }

  loadMyProfile(): void {
    this.loading = true;
    this.error = false;

    this.customerService.getMyProfile().subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadAddresses(): void {
    this.addressesLoading = true;
    this.addressService.getMyAddresses().subscribe({
      next: (list) => {
        this.addresses = list ?? [];
        this.addressesLoading = false;
      },
      error: () => {
        this.addressesLoading = false;
      }
    });
  }

  addressLine(a: CustomerAddress): string {
    return [a.street, a.district, a.city].filter(p => !!p).join('، ');
  }

  // Used purely as a legacy fallback if you still want a single-line summary
  // somewhere; the template now iterates `addresses` directly.
  get displayAddress(): string {
    if (this.customer?.mainAddress) return this.customer.mainAddress;
    if (this.addresses.length === 0) return '';
    const def = this.addresses.find(a => a.isDefault);
    if (def) return this.addressLine(def);
    // No default set — fall back to the most recently added address (highest id)
    const mostRecent = [...this.addresses].sort((a, b) => b.id - a.id)[0];
    return this.addressLine(mostRecent);
  }

  get initial(): string {
    return this.customer?.name?.charAt(0)?.toUpperCase() ?? '?';
  }
}
