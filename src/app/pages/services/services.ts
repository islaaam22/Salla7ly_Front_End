import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { Footer } from "../../shared/footer/footer";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-services',
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services {

}
