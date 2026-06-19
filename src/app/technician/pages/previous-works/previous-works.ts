import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../../services/portfolio-service';

@Component({
  selector: 'app-previous-works',
  imports: [CommonModule, FormsModule],
  templateUrl: './previous-works.html',
  styleUrl: './previous-works.css'
})
export class PreviousWorks implements OnInit {
  portfolios: any[] = [];
  loading = false;
  showModal = false;
  submitting = false;
  errorMsg = '';
  successMsg = '';
  beforePreview = '';
  afterPreview = '';
  technicianId = 1;

  form = {
    title: '',
    description: '',
    beforeImage: null as File | null,
    afterImage: null as File | null,
  };

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.portfolioService.getMyProfile().subscribe({
      next: (res) => {
        this.technicianId = Number(res.id);
        console.log('technicianId:', this.technicianId);
        this.loadPortfolios();
      },
      error: () => {
        this.loadPortfolios();
      }
    });
  }

 loadPortfolios() {
  this.loading = true;
  this.portfolioService.getByTechnicianId(this.technicianId).subscribe({
    next: (res) => {
      console.log('Portfolio item:', res[0]); // ← ضيفي السطر ده
      this.portfolios = res;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}

  openModal() {
    this.showModal = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.beforePreview = '';
    this.afterPreview = '';
    this.form = { title: '', description: '', beforeImage: null, afterImage: null };
  }

  closeModal() {
    this.showModal = false;
  }

  onImageSelect(event: any, type: 'before' | 'after') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'before') {
      this.form.beforeImage = file;
    } else {
      this.form.afterImage = file;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'before') {
        this.beforePreview = e.target.result;
      } else {
        this.afterPreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  submitProject() {
    if (!this.form.title.trim()) {
      this.errorMsg = 'يرجى إدخال عنوان المشروع';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';

    const payload = {
      technicianId: this.technicianId,
      caption: this.form.title,
      description: this.form.description,
      beforeImage: this.form.beforeImage,
      afterImage: this.form.afterImage,
    };

    console.log('Payload:', payload);

    this.portfolioService.create(payload).subscribe({
      next: (res) => {
        console.log('Success:', res);
        this.submitting = false;
        this.successMsg = 'تم إضافة المشروع بنجاح!';
        this.loadPortfolios();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        console.log('Error:', err);
        this.submitting = false;
        this.errorMsg = err?.error?.title ?? err?.error?.message ?? 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }

 showDeleteConfirm = false;
deleteTargetId: number | null = null;

openDeleteConfirm(id: number) {
  this.deleteTargetId = id;
  this.showDeleteConfirm = true;
}

cancelDelete() {
  this.showDeleteConfirm = false;
  this.deleteTargetId = null;
}

confirmDelete() {
  if (!this.deleteTargetId) return;
  this.portfolioService.delete(this.deleteTargetId).subscribe({
    next: () => {
      this.showDeleteConfirm = false;
      this.deleteTargetId = null;
      this.loadPortfolios();
    },
    error: () => alert('حدث خطأ أثناء الحذف')
  });
}
}
