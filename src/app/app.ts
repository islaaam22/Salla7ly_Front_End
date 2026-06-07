import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Register } from './pages/register/register';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'salla7ly';
}
