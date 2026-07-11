import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebar } from '../customer-sidebar/customer-sidebar';
import { AiSupport } from '../ai-support/ai-support';
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, CustomerSidebar, AiSupport],
  templateUrl: './customer-layout.html'
})
export class CustomerLayout {}