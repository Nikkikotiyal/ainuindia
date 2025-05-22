import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocationPopupComponentComponent } from '../location-popup-component/location-popup-component.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
})
export class VerifyOtpComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router // private fb: FormBuilder, // private apiService: ApiService,
  ) // private router: Router
  {}

  verifyOtp() {
    // ✅ Simulate OTP Verification Success
    console.log('✅ OTP Verified Successfully!');

    // ✅ Fetch Stored User Data (For Location)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userLocation = Array.isArray(userData?.Location)
      ? userData.Location
      : userData?.Location?.split(',').map((loc: string) => loc.trim()) || [
          'Default Location',
        ];
    this.router.navigate(['/dashboard']);
    // ✅ Show Location Popup After OTP Verification
    const dialogRef = this.dialog.open(LocationPopupComponentComponent, {
      width: '400px',
      data: { defaultLocation: userLocation },
    });

    // ✅ After Popup Closes, Navigate to Dashboard
    dialogRef.afterClosed().subscribe((selectedLocation) => {
      if (selectedLocation) {
        localStorage.setItem('userLocation', selectedLocation);
        // this.router.navigate(['/dashboard']);
        // ✅ Navigate to Dashboard
      }
    });
  }
}
