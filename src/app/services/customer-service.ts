  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { CustomerProfileDetails } from '../models/customer-model';

  @Injectable({ providedIn: 'root' })
  export class CustomerService {
    private readonly baseUrl = 'https://sala7ly.runasp.net/api/Customer';

    constructor(private http: HttpClient) {}

    getMyProfile(): Observable<CustomerProfileDetails> {
      return this.http.get<CustomerProfileDetails>(`${this.baseUrl}/me`);
    }
  }