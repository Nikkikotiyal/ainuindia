import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
// import { UserViewComponent } from './components/user-view/user-view.component';

export const routes: Routes = [
  {
    path: '',
    component:LoginComponent
  },
  {
    path: 'register',
    component:LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,  // Eager loading for testing
  },

  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent,
  },
//   {
//     path: 'userview',
// component: UserViewComponent},

];
