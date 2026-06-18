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

  technicianId = 1;

  form = {
    title: '',
    description: '',
    beforeImageUrl: '',
    afterImageUrl: '',
  };

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.loadPortfolios();
  }

  loadPortfolios() {
    this.loading = true;
    this.portfolioService.getByTechnicianId(this.technicianId).subscribe({
      next: (res) => {
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
    this.form = { title: '', description: '', beforeImageUrl: '', afterImageUrl: '' };
  }

  closeModal() {
    this.showModal = false;
  }

  onImageSelect(event: any, type: 'before' | 'after') {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'before') {
        this.form.beforeImageUrl = e.target.result;
      } else {
        this.form.afterImageUrl = e.target.result;
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
      imageUrl: this.form.beforeImageUrl || '',
      type: 'before',
      serviceRequestId: null
    };

    this.portfolioService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = 'تم إضافة المشروع بنجاح!';
        this.loadPortfolios();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: () => {
        this.submitting = false;
        this.errorMsg = 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }

  deleteProject(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;

    this.portfolioService.delete(id).subscribe({
      next: () => this.loadPortfolios(),
      error: () => alert('حدث خطأ أثناء الحذف')
    });
  }
}
