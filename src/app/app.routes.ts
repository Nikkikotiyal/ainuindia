import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

// import { AuthGuard } from './auth.guard';
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

  { path: 'dashboard', component: DashboardComponent },

  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent,
  },
  { path: '**', redirectTo: '' }
//   {
//     path: 'userview',
// component: UserViewComponent},

];
