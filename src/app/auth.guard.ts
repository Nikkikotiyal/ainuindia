import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);

  canActivate(): boolean {
    const userToken = localStorage.getItem('userToken');

    console.log('🔍 Checking Token in AuthGuard:', userToken);

    if (!userToken) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
