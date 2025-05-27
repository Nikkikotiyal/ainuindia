import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  constructor(private dialogRef: MatDialogRef<ProfileComponent>) {}
  user: any;
  userName: string = 'Guest'; // ✅ Default value
  Designation: string = 'Guest';
  Email: string = 'Guest';
  MobileNo: string = 'Guest';
  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('🔍 Stored User Data:', userData);
    this.userName = userData?.UserName || 'Guest';
    this.Designation = userData?.Designation || 'Guest';
    this.Email = userData?.Email || 'Guest';
    this.MobileNo = userData?.MobileNo || 'Guest';
  }
  closePopup() {
    this.dialogRef.close();
  }
  closeProfile(){
    console.log("hhh");

    this.dialogRef.close();
  }
}
