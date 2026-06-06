import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  imports: [Navbar, Footer],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
  constructor(private router: Router) {}

  steps = [
    { number: '01', icon: 'fa-regular fa-file-lines', title: 'أنشئ الطلب', description: 'اشرح المشكلة بالنص أو الصور أو الفيديو وحدد المكان والوقت المناسب.' },
    { number: '02', icon: 'fa-solid fa-brain', title: 'الذكاء الاصطناعي يصنّف', description: 'النظام يحلل طلبك ويصنفه تلقائياً ويقدّر نوع المهارة المطلوبة.' },
    { number: '03', icon: 'fa-solid fa-user-check', title: 'ترشيح ذكي للفنيين', description: 'نرشح لك أفضل الفنيين الموثقين بناءً على التقييم والقرب والسعر.' },
    { number: '04', icon: 'fa-regular fa-message', title: 'اختر وتواصل', description: 'اختر الفني الأنسب وابدأ محادثة فورية داخل التطبيق.' },
    { number: '05', icon: 'fa-regular fa-clock', title: 'استلم الخدمة', description: 'الفني يصل لمكانك وينجز العمل بكفاءة.' },
    { number: '06', icon: 'fa-regular fa-star', title: 'ادفع وقيّم', description: 'ادفع بأمان عبر المنصة ثم قيّم تجربتك لمساعدة باقي العملاء.' },
  ];

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
