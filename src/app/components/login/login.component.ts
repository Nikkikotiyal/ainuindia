interface LoginResponse {
  success: boolean;
  token: string;
  userData?: any;
}

import { ChangeDetectorRef, Component } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    this.cdr.detectChanges(); // ✅ Forces UI refresh if stuck
  }

  // emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  // passwordRegex =
  //   '^(?=.{8,})((?=.*[^a-zA-Zs])(?=.*[a-z])(?=.*[A-Z])| (?=.*[^a-zA-Z0-9s])(?=.*d)(?=.*[a-zA-Z])).*$';

  ngOnInit(): void {
    // console.log('Background animation started!');
    const images: string[] = [
      'assets/c1e4f92fd014f025cf45d378b573977d.jpg',
      'assets/backgroundimg.jpg',
      'assets/b7b952774a146d6f83c9c2837e2c86b1.jpg',
      // src/assets/backgroundimg.jpg
    ];

    let index = 0;

    setInterval(() => {
      const bgElement = document.querySelector('.sliding-bg') as HTMLElement;
      if (bgElement) {
        // console.log('✅ Current Image Index:', index); // Debugging
        // console.log('🔄 Changing Background To:', images[index]); // Debugging
        bgElement.style.backgroundImage = `url(${images[index]})`;
        index = (index + 1) % images.length;
      } else {
        // console.error('❌ Background element not found!');
      }
    }, 2000);
    // this.userLocation = localStorage.getItem('userLocation') || 'Default Location';
    this.loginForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required]],
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
        if (response.token && response.user) {
          console.log('🔐 Token:', response.token);

          localStorage.setItem('userToken', response.token);
          localStorage.setItem('userData', JSON.stringify(response.user));

          // ✅ Call sendOtp after successful login
          this.apiService.sendOtp(emailOrUsername).subscribe({
            next: () => {
              console.log('📩 OTP sent successfully!');
              this.snackBar.open('✅ OTP sent successfully!', 'Close', {
                duration: 2000,
                panelClass: ['success-snackbar'],
                horizontalPosition: 'center', // ✅ Positions it centrally
                verticalPosition: 'top', // ✅ Moves it to the top
              });
              this.router.navigate(['/verifyOtp'], {
                state: { email: emailOrUsername },
              }); // ✅ Use state instead
            },
            error: (error) => {
              console.error('❌ Failed to send OTP:', error);
            },
          });
        } else {
          console.error('❌ Token missing in API response.');
        }
      },
      error: (error) => {
        console.error('❌ Login Failed:', error);
        console.log('🔍 Full Error Object:', JSON.stringify(error, null, 2));

        if (error?.status === 403) {
          this.loginError =
            error?.error?.message || 'Your account has been deactivated.';
        } else {
          this.loginError =
            error.message || error.error || 'Login failed. Try again.';
        }

        this.cdr.detectChanges(); // ✅ Forces UI refresh
      },
    });

    console.log('🚀 Login request sent to API.');
  }
}
