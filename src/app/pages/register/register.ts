import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";
import { OnInit } from "@angular/core";

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit {
  selectedRole: string = 'customer';

  // قائمة الكاتيجوريز المتاحة
  availableCategories = [
    { id: 1, name: 'كهرباء' },
    { id: 2, name: 'سباكة' },
    { id: 3, name: 'تكييف' },
    { id: 4, name: 'نجارة' },
  ];

  ngOnInit() {
    const role = this.route.snapshot.queryParamMap.get('role');
    if (role === 'tech' || role === 'technician') {
      this.selectedRole = 'tech';
    }
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  loading = false;
  errorMsg: string = '';
  nameError: string = '';
  emailError: string = '';
  passwordError: string = '';

  customerFile: File | null = null;
  techFile: File | null = null;

  customer = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    image: null
  };

  technician = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    experienceYears: 0,
    image: null,
    categoryIds: [] as number[]
  };

  admin = {
    name: '',
    email: '',
    password: ''
  };

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار صورة صحيحة');
        return;
      }

      if (this.selectedRole === 'customer') {
        this.customerFile = file;
      } else if (this.selectedRole === 'tech') {
        this.techFile = file;
      }
    }
  }

  toggleCategory(id: number) {
    const index = this.technician.categoryIds.indexOf(id);
    if (index > -1) {
      this.technician.categoryIds.splice(index, 1);
    } else {
      this.technician.categoryIds.push(id);
    }
    console.log('Selected Categories:', this.technician.categoryIds);
  }

  constructor(private router: Router, private authService: Auth, private route: ActivatedRoute) {}

  validate(): boolean {
    this.nameError = '';
    this.emailError = '';
    this.passwordError = '';
    let valid = true;

    let data: any;

    if (this.selectedRole === 'customer') data = this.customer;
    else if (this.selectedRole === 'tech') data = this.technician;
    else data = this.admin;

    // NAME
    if (!data.name || data.name.trim() === '') {
      this.nameError = 'الاسم الكامل مطلوب';
      valid = false;
    } else if (data.name.length < 3) {
      this.nameError = 'الاسم يجب أن يكون 3 أحرف على الأقل';
      valid = false;
    }

    // EMAIL
    if (!data.email) {
      this.emailError = 'البريد الإلكتروني مطلوب';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      this.emailError = 'صيغة البريد الإلكتروني غير صحيحة';
      valid = false;
    }

    // PASSWORD - التعديل الجديد
    if (!data.password) {
      this.passwordError = 'كلمة المرور مطلوبة';
      valid = false;
    } else if (data.password.length < 8) {
      this.passwordError = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      valid = false;
    } else if (!/(?=.*[a-z])/.test(data.password)) {
      this.passwordError = 'كلمة المرور يجب أن تحتوي على حرف صغير على الأقل';
      valid = false;
    } else if (!/(?=.*[A-Z])/.test(data.password)) {
      this.passwordError = 'كلمة المرور يجب أن تحتوي على حرف كبير على الأقل';
      valid = false;
    } else if (!/(?=.*\d)/.test(data.password)) {
      this.passwordError = 'كلمة المرور يجب أن تحتوي على رقم على الأقل';
      valid = false;
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(data.password)) {
      this.passwordError = 'كلمة المرور يجب أن تحتوي على رمز خاص على الأقل (!@#$%^&*)';
      valid = false;
    }

    return valid;
  }

  onRegister() {
    if (!this.validate()) return;

    this.loading = true;
    this.errorMsg = '';

    if (this.selectedRole === 'customer') {
      const formData = new FormData();
      formData.append('Name', this.customer.name);
      formData.append('Email', this.customer.email);
      formData.append('Password', this.customer.password);
      formData.append('PhoneNumber', this.customer.phoneNumber || '');
      if (this.customerFile) {
        formData.append('Image', this.customerFile);
      }

      this.authService.registerCustomer(formData).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
          console.error('Customer Error:', err);
        }
      });
    }
    else if (this.selectedRole === 'tech') {
      const formDataTech = new FormData();
      
      // إضافة البيانات الأساسية
      formDataTech.append('Name', this.technician.name);
      formDataTech.append('Email', this.technician.email);
      formDataTech.append('PhoneNumber', this.technician.phoneNumber || '');
      formDataTech.append('Password', this.technician.password);
      formDataTech.append('ExperienceYears', this.technician.experienceYears.toString());
      
      // إضافة الصورة (اختيارية)
      if (this.techFile) {
        formDataTech.append('Image', this.techFile, this.techFile.name);
      }
      
      // إضافة الكاتيجوريز (اختيارية)
      if (this.technician.categoryIds && this.technician.categoryIds.length > 0) {
        this.technician.categoryIds.forEach(id => {
          formDataTech.append('CategoryIds', id.toString());
        });
      }

      console.log('Sending Tech Data:');
      formDataTech.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      this.authService.registerTechnician(formDataTech).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('Registration Success:', res);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
          console.error('Tech Registration Error:', err);
          console.error('Error Status:', err.status);
          console.error('Error Response:', err.error);
        }
      });
    }
    else if (this.selectedRole === 'admin') {
      const adminData = {
        name: this.admin.name,
        email: this.admin.email,
        password: this.admin.password
      };
      this.authService.registerAdmin(adminData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/login'])
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
          console.error('Admin Error:', err);
        }
      });
    }
  }
}