import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Contact } from './pages/contact/contact';
import { HowItWorks } from './pages/how-it-works/how-it-works';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { WhoAreWe } from './pages/who-are-we/who-are-we';
import { Services } from './pages/services/services';
import { Notfound } from './pages/notfound/notfound';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { VerifyOtp } from './pages/verify-otp/verify-otp';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Chat } from './pages/chat/chat';
import { ChatWindow } from './pages/chat/chat-window/chat-window';
import { ConversationList } from './pages/chat/conversation-list/conversation-list';
import { MessageBuddle } from './pages/chat/message-buddle/message-buddle';
import { CustomerProfile } from './pages/customer-profile/customer-profile';
import { CustomerLayout } from './pages/customer-layout/customer-layout';

import { CustomerEdit } from './pages/customer-edit/customer-edit';

import { NewRequest } from './pages/customer/new-request/new-request';
import { MyRequests } from './pages/customer/my-requests/my-requests';
import { Review } from './pages/customer/review/review';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'contact', component: Contact },
  { path: 'how-it-works', component: HowItWorks },
  { path: 'who-are-we', component: WhoAreWe },
  { path: 'services', component: Services },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'reset-password', component: ResetPassword },
  {path : 'chat' , component: Chat},
  // {path : 'chat-window' , component: ChatWindow},
  // {path : 'conversation-list' , component: ConversationList},
  // {path : 'message-buddle' , component: MessageBuddle},
  {
    path: 'customer',
    component: CustomerLayout,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: CustomerProfile },
      { path: 'edit', component: CustomerEdit },
      { path: 'new-request', component: NewRequest },
      { path: 'my-requests', component: MyRequests },
      { path: 'review/:id', component: Review },
    ]
  },
  { path: '404', component: Notfound },
  { path: '**', redirectTo: '404' },
];
