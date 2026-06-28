import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Contact } from './pages/contact/contact';
import { HowItWorks } from './pages/how-it-works/how-it-works';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { WhoAreWe } from './pages/who-are-we/who-are-we';
import { Services } from './pages/services/services';
import { Notfound } from './pages/notfound/notfound';
import { Notifications } from './pages/notifications/notifications';

import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { VerifyOtp } from './pages/verify-otp/verify-otp';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ChatComponent } from './pages/chat/chat';
import { CustomerProfile } from './pages/customer-profile/customer-profile';
import { CustomerLayout } from './pages/customer-layout/customer-layout';
import { CustomerEdit } from './pages/customer-edit/customer-edit';

import { NewRequest } from './pages/customer/new-request/new-request';
import { MyRequests } from './pages/customer/my-requests/my-requests';
import { Review } from './pages/customer/review/review';

import { TechnicianLayout } from './technician/layout/technician-layout';
import { TechnicianProfile } from './technician/pages/profile/profile';
import { TechnicianEditProfile } from './technician/pages/edit-profile/edit-profile';
import { AvailableRequests } from './technician/pages/available-requests/available-requests';
import { TechnicianVerification } from './technician/pages/verification/verification';
import { PreviousWorks } from './technician/pages/previous-works/previous-works';
import { BidComparisonComponent } from './pages/submit-bids/submit-bids';
import { ReceivedBidsComponent } from './pages/received-bids/received-bids';
import { BidsByCategoryComponent } from './pages/bids-by-category/bids-by-category';
import { AssignedTasksComponent } from './technician/pages/assigned-tasks/assigned-tasks';
import { TaskDetailsComponent } from './technician/pages/task-details/task-details';

import { AdminLayout } from './admin/layout/admin-layout/admin-layout';
import { Dashboard } from './admin/pages/dashboard/dashboard';
import { AdminStatistics } from './admin/pages/statistics/statistics';
import { AdminCustomers } from './admin/pages/customers/customers';
import { Wallet } from './pages/wallet/wallet';
import { AdminRequests } from './admin/pages/requests/requests';
import { AdminBids } from './admin/pages/Bids/bids';
import { TechniciansComponent } from './admin/pages/technicians/technicians';
import { TechnicianProfileComponent } from './admin/pages/technician-profile/technician-profile';


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
  { path: 'notifications', component: Notifications },
  { path: 'wallet', component: Wallet },
  {
    path: 'customer',
    component: CustomerLayout,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: CustomerProfile },
      { path: 'edit', component: CustomerEdit },
      { path: 'new-request', component: NewRequest },
      { path: 'my-requests', component: MyRequests },
      { path: 'review/:id', component: Review },
      { path: 'chat', component: ChatComponent },
      { path: 'chat/:id', component: ChatComponent },
      { path: 'received-bids', component: ReceivedBidsComponent },
      { path: 'submit-bid/:id', component: BidComparisonComponent },
      { path: 'bids-category/:categoryId', component: BidsByCategoryComponent },
    ],
  },
  {
    path: 'technician',
    component: TechnicianLayout,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: TechnicianProfile },
      { path: 'edit-profile', component: TechnicianEditProfile },
      { path: 'available-requests', component: AvailableRequests },
      { path: 'chat', component: ChatComponent },
      { path: 'chat/:id', component: ChatComponent },
      { path: 'notifications', component: Notifications },
      { path: 'verification', component: TechnicianVerification },
      { path: 'previous-works', component: PreviousWorks },
      { path: 'assigned-tasks', component: AssignedTasksComponent },
      { path: 'task-details/:id', component: TaskDetailsComponent },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'notifications', component: Notifications },
      { path: 'statistics', component: AdminStatistics },
      { path: 'customers', component: AdminCustomers },
    ],
  },
{
  path: 'admin',
  component: AdminLayout,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard },
    { path: 'statistics', component: AdminStatistics },
    { path: 'customers', component: AdminCustomers },
    { path: 'requests', component: AdminRequests },
    { path: 'Bids', component: AdminBids },
    { path: 'technicians', component: TechniciansComponent },
    { path: 'technicians/:id', component: TechnicianProfileComponent },

  ]
},

  { path: '404', component: Notfound },
  { path: '**', redirectTo: '404' },
];
