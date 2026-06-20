import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';

interface Customer {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  totalRequests: number;
  isActive: boolean;
  imageUrl: string | null;
  phoneNumber?: string | null;
}

interface CustomerDetail {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  mainAddress: string;
  totalRequests: number;
  totalReviews: number;
  memberSinceYear: number;
}

type FilterTab = 'all' | 'active' | 'pending';

@Component({
  selector: 'app-admin-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class AdminCustomers implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';

  customers: Customer[] = [];
  searchTerm = '';
  activeTab: FilterTab = 'all';

  // ── View modal ────────────────────────────────────────────────
  showViewModal = false;
  viewLoading = false;
  viewCustomer: CustomerDetail | null = null;

  // ── Edit modal ────────────────────────────────────────────────
  showEditModal = false;
  editLoading = false;
  editSaving = false;
  editErrorMsg = '';
  editId: number | null = null;
  editName = '';
  editPhone = '';
  editAddress = '';
  editImageFile: File | null = null;
  editCurrentImageUrl = '';

  // ── Delete modal ──────────────────────────────────────────────
  showDeleteModal = false;
  deleteCustomer: Customer | null = null;
  deleting = false;
  deleteErrorMsg = '';

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadCustomers();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

loadCustomers() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<Customer[]>(`${this.apiUrl}/Customer`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.customers = data || [];
        this.loading = false;
        this.loadPhoneNumbers();
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل بيانات العملاء';
        }
      }
    });
  }

  // The list endpoint doesn't return phoneNumber, so fetch each customer's
  // detail in the background and fill it in once available.
  private loadPhoneNumbers() {
    this.customers.forEach((customer) => {
      this.http.get<CustomerDetail>(`${this.apiUrl}/Customer/${customer.id}`, { headers: this.authHeaders() }).subscribe({
        next: (detail) => {
          customer.phoneNumber = detail.phoneNumber || '';
        },
        error: () => {
          // silently ignore — keep showing '—' for this row
        }
      });
    });
  }




  // ── Tab counts ──────────────────────────────────────────────────
  get countAll(): number {
    return this.customers.length;
  }

  get countActive(): number {
    return this.customers.filter(c => c.isActive).length;
  }

  get countPending(): number {
    return this.customers.filter(c => !c.isActive).length;
  }

  setTab(tab: FilterTab) {
    this.activeTab = tab;
  }

  // ── Filtered list (tab + search) ───────────────────────────────
  get filteredCustomers(): Customer[] {
    let list = this.customers;

    if (this.activeTab === 'active') {
      list = list.filter(c => c.isActive);
    } else if (this.activeTab === 'pending') {
      list = list.filter(c => !c.isActive);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    }

    return list;
  }

  // ── Helpers ─────────────────────────────────────────────────────
  avatarLetter(name: string): string {
    return (name || 'C').trim().charAt(0).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // ── VIEW ─────────────────────────────────────────────────────────
  onView(customer: Customer) {
    this.showViewModal = true;
    this.viewLoading = true;
    this.viewCustomer = null;

    this.http.get<CustomerDetail>(`${this.apiUrl}/Customer/${customer.id}`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.viewCustomer = data;
        this.viewLoading = false;
      },
      error: () => {
        this.viewLoading = false;
      }
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewCustomer = null;
  }

  // ── EDIT ─────────────────────────────────────────────────────────
  onEdit(customer: Customer) {
    this.showEditModal = true;
    this.editErrorMsg = '';
    this.editLoading = true;
    this.editId = customer.id;
    this.editImageFile = null;

    this.http.get<CustomerDetail>(`${this.apiUrl}/Customer/${customer.id}`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.editName = data.name || '';
        this.editPhone = data.phoneNumber || '';
        this.editAddress = data.mainAddress || '';
        this.editCurrentImageUrl = data.imageUrl || '';
        this.editLoading = false;
      },
      error: () => {
        this.editName = customer.name || '';
        this.editPhone = customer.phoneNumber || '';
        this.editAddress = '';
        this.editCurrentImageUrl = customer.imageUrl || '';
        this.editLoading = false;
      }
    });
  }

  onEditImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editImageFile = file;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editId = null;
  }

  onSaveEdit() {
    if (!this.editId) return;

    if (!this.editName || !this.editPhone) {
      this.editErrorMsg = 'الاسم ورقم الهاتف مطلوبان';
      return;
    }

    this.editSaving = true;
    this.editErrorMsg = '';

    const formData = new FormData();
    formData.append('Name', this.editName);
    formData.append('PhoneNumber', this.editPhone);
    formData.append('AddressDetails', this.editAddress || '');
    if (this.editImageFile) {
      formData.append('Image', this.editImageFile, this.editImageFile.name);
    }

    this.http.put(`${this.apiUrl}/Customer/${this.editId}`, formData, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.editSaving = false;
        this.closeEditModal();
        this.loadCustomers();
      },
      error: (err: any) => {
        this.editSaving = false;
        this.editErrorMsg = err.error?.message || 'حدث خطأ أثناء حفظ التعديلات';
      }
    });
  }

  // ── DELETE ───────────────────────────────────────────────────────
  onDelete(customer: Customer) {
    this.showDeleteModal = true;
    this.deleteCustomer = customer;
    this.deleteErrorMsg = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteCustomer = null;
  }

  confirmDelete() {
    if (!this.deleteCustomer) return;

    this.deleting = true;
    this.deleteErrorMsg = '';

    this.http.delete(`${this.apiUrl}/Customer/${this.deleteCustomer.id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.deleting = false;
        this.customers = this.customers.filter(c => c.id !== this.deleteCustomer!.id);
        this.closeDeleteModal();
      },
      error: (err: any) => {
        this.deleting = false;
        this.deleteErrorMsg = err.error?.message || 'حدث خطأ أثناء حذف العميل';
      }
    });
  }
}