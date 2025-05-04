import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  @Output() userAdded = new EventEmitter<void>();
  dropdownOpen: boolean = false;
  searchText: string = '';
  allLocations: string[] = ['Banjara Hills', 'Dilsukhnagar', 'HITECH city', 'Visakhapatnam', 'Siliguri', 'Secunderabad','Chennai'];
  selectedLocations: string[] = [];
  filteredLocations: string[] = [...this.allLocations];
  constructor(
    private dialogRef: MatDialogRef<AddUserComponent>,
    private apiService: ApiService
  ) {}

  formData = {
    UserName: '',
    Password: '', // ✅ Ensure Password is here
    Designation: '',
    Email: '',
    MobileNo: '', // ✅ Corrected from 'mobile' to 'MobileNo'
    Location: '', // ✅ Ensure location exists
    Status: 'A',
    role: ''
  };

  addUserSuccesfully() {
    console.log('📝 Form Data Before Sending:', this.formData);
    console.log('🧾 FINAL Form Data:', {
      username: this.formData.UserName,
      password: 'defaultPassword123',
      designation: this.formData.Designation,
      email: this.formData.Email,
      role: this.formData.role || 'User',
      mobileNo: this.formData.MobileNo,
      status: this.formData.Status || 'A',
      location: this.formData.Location
    });

    this.apiService
      .signupUsers(

        this.formData.UserName, // Should be 'username' in backend
        'defaultPassword123',
        this.formData.Designation, // Correctly passed
        this.formData.Email, // Correctly passed
        this.formData.role || 'User', // Correctly passed or defaulted
        this.formData.MobileNo, // Should be 'mobileNo' in backend
        this.formData.Status || 'A', // Default if not passed
        this.formData.Location

      )

      .subscribe({
        next: (res:any) => {
          console.log('✅ User added successfully:', res);
          this.userAdded.emit(res);
          console.log(res)// ✅ Notify DashboardComponent
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('❌ Error creating user:', err);
        }
      });
  }


  filterLocations() {
    this.filteredLocations = this.allLocations.filter(loc =>
      loc.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(l => l !== location);
    } else {
      this.selectedLocations.push(location);
    }

    // ✅ Ensure `formData.Location` is updated correctly
    this.formData.Location = this.selectedLocations.join(', ');
    console.log('Updated Location:', this.formData.Location); // 🔍 Debugging check
  }

  removeLocation(location: string) {
    this.selectedLocations = this.selectedLocations.filter(l => l !== location);
  }



}

