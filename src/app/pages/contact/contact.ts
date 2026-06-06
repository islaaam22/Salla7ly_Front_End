import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule, Navbar, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  form = { name: '', email: '', subject: '', message: '' };
  loading = false;
  successMsg = '';

  // Validation errors
  nameError = '';
  emailError = '';
  subjectError = '';
  messageError = '';

  validate(): boolean {
    this.nameError = '';
    this.emailError = '';
    this.subjectError = '';
    this.messageError = '';
    let valid = true;

    if (!this.form.name.trim()) {
      this.nameError = 'الاسم مطلوب';
      valid = false;
    }

    if (!this.form.email.trim()) {
      this.emailError = 'البريد الإلكتروني مطلوب';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.emailError = 'صيغة البريد الإلكتروني غير صحيحة';
      valid = false;
    }

    if (!this.form.subject.trim()) {
      this.subjectError = 'الموضوع مطلوب';
      valid = false;
    }

    if (!this.form.message.trim()) {
      this.messageError = 'الرسالة مطلوبة';
      valid = false;
    } else if (this.form.message.trim().length < 10) {
      this.messageError = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) return;

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.';
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 1000);
  }
}
