import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerAddress, CreateAddressDto, UpdateAddressDto } from '../models/Address-model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly baseUrl = 'https://sala7ly.runasp.net/api/Address';

  constructor(private http: HttpClient) {}

  /** GET /api/Address — returns the logged-in customer's saved addresses */
  getMyAddresses(): Observable<CustomerAddress[]> {
    return this.http.get<CustomerAddress[]>(`${this.baseUrl}`);
  }

  /** POST /api/Address — create a new address */
  createAddress(dto: CreateAddressDto): Observable<any> {
    return this.http.post(`${this.baseUrl}`, dto, { responseType: 'text' });
  }

  /** PUT /api/Address/{id} — update an existing address */
  updateAddress(id: number, dto: UpdateAddressDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, { responseType: 'text' });
  }

  /** DELETE /api/Address/{id} — remove an address */
  deleteAddress(id: number, deletedBy?: string): Observable<any> {
    const url = deletedBy
      ? `${this.baseUrl}/${id}?deletedBy=${encodeURIComponent(deletedBy)}`
      : `${this.baseUrl}/${id}`;
    return this.http.delete(url, { responseType: 'text' });
  }

  /** PUT /api/Address/{id}/set-default — mark an address as the default one */
  setDefault(id: number, customerProfileId?: number): Observable<any> {
    const url = customerProfileId
      ? `${this.baseUrl}/${id}/set-default?customerProfileId=${customerProfileId}`
      : `${this.baseUrl}/${id}/set-default`;
    return this.http.put(url, {}, { responseType: 'text' });
  }
}
