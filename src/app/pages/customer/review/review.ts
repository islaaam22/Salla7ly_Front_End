import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review.html',
  styleUrl: './review.css'
})
export class Review implements OnInit {
  requestId: number = 0;
  loading = false;
  successMsg = '';

  ratings = {
    overall: 4,
    quality: 4,
    communication: 4,
    punctuality: 4,
  };

  comment = '';

  stars = [1, 2, 3, 4, 5];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
  }

  setRating(field: keyof typeof this.ratings, value: number) {
    this.ratings[field] = value;
  }

  onSubmit() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'تم إرسال تقييمك بنجاح!';
      setTimeout(() => this.router.navigate(['/customer/my-requests']), 1500);
    }, 1000);
  }
}
