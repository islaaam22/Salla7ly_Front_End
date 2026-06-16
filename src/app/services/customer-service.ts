import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerProfileDetails, CustomerProfileUpdate } from '../models/customer-model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = 'https://sala7ly.runasp.net/api/Customer';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<CustomerProfileDetails> {
    return this.http.get<CustomerProfileDetails>(`${this.baseUrl}/me`);
  }

  updateProfile(id: number, data: CustomerProfileUpdate): Observable<any> {
    // endpoint consumes multipart/form-data, so send FormData (not JSON)
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('AddressDetails', data.mainAddress);

    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }
}
