import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { Footer } from "../../shared/footer/footer";

@Component({
  selector: 'app-who-are-we',
  imports: [Navbar, Footer],
  templateUrl: './who-are-we.html',
  styleUrl: './who-are-we.css',
})
export class WhoAreWe {

}
