import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
export class AuthGuard implements CanActivate {

  constructor(private router: Router,private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/']); // Redirect to login page
      return false;
    }
  }
}
