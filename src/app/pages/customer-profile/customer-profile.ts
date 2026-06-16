import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer-service';
import { CustomerProfileDetails } from '../../models/customer-model';
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

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadMyProfile();
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

  get initial(): string {
    return this.customer?.name?.charAt(0)?.toUpperCase() ?? '?';
  }
}
