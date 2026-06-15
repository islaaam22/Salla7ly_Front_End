import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { Footer } from "../../shared/footer/footer";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
