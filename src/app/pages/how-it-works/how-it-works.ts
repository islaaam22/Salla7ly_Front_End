import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-how-it-works',
  imports: [Navbar, Footer],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {

  toggleFaq(element: EventTarget | null): void {
    if (element instanceof HTMLElement) {
      element.classList.toggle('open');
    }
  }
}
