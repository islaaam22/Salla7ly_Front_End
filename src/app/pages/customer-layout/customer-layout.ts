import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerSidebar } from '../customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, CustomerSidebar],
  templateUrl: './customer-layout.html'
})
export class CustomerLayout {}