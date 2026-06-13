import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../customer-sidebar/customer-sidebar';   // adjust path to your sidebar component

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './customer-layout.html'
})
export class CustomerLayout {}