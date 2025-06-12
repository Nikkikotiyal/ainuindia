import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthGuard } from './auth.guard';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { LogComponent } from './components/log/log.component';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: LoginComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent,
  },

  {
    path: 'verifyOtp',
    component: VerifyOtpComponent,
  },

  {
    path: 'logs',
    component: LogComponent,
  },
  // { path: '**', redirectTo: '' ,
  //   component: LoginComponent,
  // },
];
