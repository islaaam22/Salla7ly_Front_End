import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";
import { OnInit } from "@angular/core";

@Component({
  selector: 'app-register',
  imports: [RouterLink,  FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register implements OnInit {
  selectedRole: string = 'customer';

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
  image: null
};

admin = {
  name: '',
  email: '',
  password: ''
};



onFileSelected(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];

    if (this.selectedRole === 'customer') {
      this.customerFile = file;
    } else if (this.selectedRole === 'tech') {
      this.techFile = file;
    }
  }
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

  // PASSWORD
  if (!data.password) {
    this.passwordError = 'كلمة المرور مطلوبة';
    valid = false;
  } else if (data.password.length < 6) {
    this.passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    valid = false;
  }

  return valid;
}

onRegister() {
  console.log(this.customer);
  if (!this.validate()) return;

  this.loading = true;
  this.errorMsg = '';

if (this.selectedRole === 'customer')
{
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
      }
    });
}

else if(this.selectedRole === 'tech')
{
  const formDataTech = new FormData();
  formDataTech.append('name', this.technician.name);
  formDataTech.append('email', this.technician.email);
  formDataTech.append('phoneNumber', this.technician.phoneNumber);
  formDataTech.append('password', this.technician.password);
  if (this.techFile) {
    formDataTech.append('image', this.techFile);
  }
  formDataTech.append('experienceYears', this.technician.experienceYears.toString());

  this.authService.registerTechnician(formDataTech).subscribe({
    next: (res) => {
      this.loading = false;
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false;
      this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
    }
  });
  }


else if(this.selectedRole === 'admin')
  {
    const adminData = {
      name: this.admin.name,
      email: this.admin.email,
      password: this.admin.password
    };
    this.authService.registerAdmin(adminData).subscribe({
      next:() => {
        this.loading = false;
        this.router.navigate(['/login'])
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      }
    });
  }
}
}

