import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocationPopupComponentComponent } from '../location-popup-component/location-popup-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
})
export class VerifyOtpComponent {
  email!: string; // ✅ Ensure email is initialized correctly
  otp!: string;
  otpError: string = '';
  invalidOtpError: string = '';
  otpInputs: string[] = ['', '', '', ''];

  // ViewChild references for OTP input fields
  @ViewChild('otp0') otp0!: ElementRef;
  @ViewChild('otp1') otp1!: ElementRef;
  @ViewChild('otp2') otp2!: ElementRef;
  @ViewChild('otp3') otp3!: ElementRef;
  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {
    this.email = history.state.email || ''; // ✅ Get email from URL
    console.log('📩 Email extracted:', this.email);

    // 🛠️ Remove email from URL after extracting it
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge',
    });
  }

  moveToNext(event: any, index: number) {
    const inputValue = event.target.value;
    if (!/^[0-9]$/.test(inputValue)) {
      event.target.value = ''; // ✅ Prevent non-numeric input
      return;
    }

    this.otpInputs[index] = inputValue; // ✅ Store OTP dynamically

    if (index < 3 && inputValue !== '') {
      event.target.nextElementSibling?.focus(); // ✅ Move to next input
    }
  }

  verifyOtp() {
    this.otp =
      this.otp0.nativeElement.value +
      this.otp1.nativeElement.value +
      this.otp2.nativeElement.value +
      this.otp3.nativeElement.value;

    console.log('📩 Email being sent:', this.email);
    console.log('🔑 OTP being sent:', this.otp);

    if (!this.email || this.otp.length !== 4) {
      console.log('❌ Missing email or incorrect OTP length!');
      this.otpError = 'Please enter a valid 4-digit OTP.';
      return;
    }

    this.apiService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userLocation = Array.isArray(userData?.Location)
          ? userData.Location
          : userData?.Location?.split(',').map((loc: string) => loc.trim()) || [
              'Default Location',
            ];

        // ✅ Show Location Popup After OTP Verification
        const dialogRef = this.dialog.open(LocationPopupComponentComponent, {
          width: '400px',
          data: { defaultLocation: userLocation },
        });

        // ✅ After Popup Closes, Navigate to Dashboard
        dialogRef.afterClosed().subscribe((selectedLocation) => {
          if (selectedLocation) {
            localStorage.setItem('userLocation', selectedLocation);
          }
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.log('❌ API Error:', error);

        // ✅ Assign error to `invalidOtpError`
        if (error.status === 400 && error.error?.message === 'Invalid OTP') {
          this.invalidOtpError = '🚨 Incorrect OTP! Please try again.';
        } else {
          this.invalidOtpError =
            error.error?.message || 'Something went wrong!';
        }

        // ✅ Display error in UI & Snackbar
        // this.snackBar.open(this.invalidOtpError, 'Close', {
        //   duration: 3000,
        //   panelClass: ['error-snackbar'],
        // });
      },
    });
  }

  resendOtp() {
    console.log('🔄 Requesting OTP resend for:', this.email);

    // 🏁 Show an immediate snackbar before API call finishes
    this.snackBar.open('🔄 Requesting new OTP...', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    this.apiService.resendOtp(this.email).subscribe({
      next: () => {
        console.log('✅ OTP resent successfully!');
        this.snackBar.open('✅ New OTP sent! Check your inbox.', 'Close', {
          duration: 6000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.otpError = 'A new OTP has been sent!';
      },
      error: (error) => {
        console.error('❌ Failed to resend OTP:', error);
        this.snackBar.open('❌ Error resending OTP!', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.otpError = error.error?.message || 'Error resending OTP.';
      },
    });
  }
  navigateToLogin() {
    this.router.navigate(['']);
  }
}
