import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerAddress } from '../models/Address-model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly baseUrl = 'https://sala7ly.runasp.net/api/Address';

  constructor(private http: HttpClient) {}

  /** GET /api/Address — returns the logged-in customer's saved addresses */
  getMyAddresses(): Observable<CustomerAddress[]> {
    return this.http.get<CustomerAddress[]>(`${this.baseUrl}`);
  }
}
