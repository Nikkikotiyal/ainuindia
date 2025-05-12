interface LoginResponse {
  success: boolean;
  token: string;
  userData?: any;
}

import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../api.service';
import { LocationPopupComponentComponent } from '../location-popup-component/location-popup-component.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  submitted = false;
  loginError: string = '';
  // date = new Date().getFullYear();
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  userLocation: any;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}


  // emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  // passwordRegex =
  //   '^(?=.{8,})((?=.*[^a-zA-Zs])(?=.*[a-z])(?=.*[A-Z])| (?=.*[^a-zA-Z0-9s])(?=.*d)(?=.*[a-zA-Z])).*$';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrUsername: [
        '',
        [Validators.required],
      ],
      password: [
        '',
        [Validators.required],
      ],
      rememberMe: [false],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  onLogin() {
    this.submitted = true;
    this.loginError = ''; // Reset error

    this.loginForm.markAllAsTouched();
    console.log('🔥 Form submitted');

    if (this.loginForm.invalid) {
      console.error('❌ Form is invalid');
      return;
    }

    const { emailOrUsername, password } = this.loginForm.value;

    console.log('📌 Attempting login with:', emailOrUsername, password);
    this.apiService.login(emailOrUsername, password).subscribe({
      next: (response: any) => {
        // localStorage.setItem('token', response.token);
        // localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.userData || {}));
        localStorage.setItem('token', 'yourAuthToken');
        this.router.navigate(['/dashboard']);

        const dialogRef = this.dialog.open(LocationPopupComponentComponent, {
          width: '400px',
        });

        dialogRef.afterClosed().subscribe(selectedLocation => {
          if (selectedLocation) {
            this.userLocation = selectedLocation;
          }
        });
      },
      error: (error) => {
        console.error('❌ Login Failed:', error);
        this.loginError = error?.error?.message || 'Invalid credentials. Try again.';
      },
    });

    console.log('🚀 Login request sent to API.');
  }

}
