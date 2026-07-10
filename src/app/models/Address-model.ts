// Shape actually returned by GET /api/Address
// (confirmed from live network response: { id, title, street, city, district, isDefault } — title is currently always null on the backend)
export interface CustomerAddress {
  id: number;
  title?: string | null;
  street?: string;
  city?: string;
  district?: string;
  isDefault?: boolean;
}

// Body for POST /api/Address  (matches CreateAddressDto)
export interface CreateAddressDto {
  customerId: number;
  title: string;
  street: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

// Body for PUT /api/Address/{id}  (matches UpdateAddressDto)
export interface UpdateAddressDto {
  title: string;
  street: string;
  city: string;
  district?: string;
  updatedBy?: string;
}
