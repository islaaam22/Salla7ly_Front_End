import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-register',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  selectedRole: string = 'customer';

selectRole(role: string) {
  this.selectedRole = role;
}
}
