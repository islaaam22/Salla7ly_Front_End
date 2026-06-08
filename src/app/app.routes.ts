import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Contact } from './pages/contact/contact';
import { HowItWorks } from './pages/how-it-works/how-it-works';
import { Home } from './pages/home/home';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'contact', component: Contact },
  { path: 'how-it-works', component: HowItWorks },
];