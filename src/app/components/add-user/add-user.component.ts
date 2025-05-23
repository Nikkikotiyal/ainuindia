import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../api.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule, CommonModule, MatSnackBarModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddUserComponent {
  userForm: FormGroup;
  @Output() userAdded = new EventEmitter<void>();
  errorMessage: string = '';
  dropdownOpen: boolean = false;
  searchText: string = '';
  allLocations: string[] = [
    'Banjara Hills',
    'Dilsukhnagar',
    'HITECH city',
    'Visakhapatnam',
    'Siliguri',
    'Secunderabad',
    'Chennai',
  ];
  isPopupVisible = false;
  isEditing = false;
  selectedLocations: string[] = [];
  filteredLocations: string[] = [...this.allLocations];
  showToaster: boolean = false; // ✅ Initialize property

  constructor(
    private fb: FormBuilder, // ✅ Inject FormBuilder
    private dialogRef: MatDialogRef<AddUserComponent>,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cd: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      UserName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      Designation: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Role: new FormControl('', [Validators.required]),
      MobileNo: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/), // Ensures exactly 10 digits
      ]),
      Status: ['A'],
      Location: [''],
    });
  }
  // ✅ File: add-user.component.ts

  ngOnInit(): void {
    console.log('📢 Received Data in Dialog:', this.data);
    // console.log('📢 Received userId:', this.data?.userData);

    // if (!this.data?.userId) {
    //   console.error("❌ No valid user ID received in dialog!");
    //   // return;
    // }
    // this.apiService.getUserById(this.data.userId).subscribe({
    //   next: (response) => {
    //     console.log('✅ API Response:', response);
    //     if (!response?.data) {
    //       console.error("❌ No user data found!");
    //       return;
    //     }
    if (this.data) {
      this.isEditing = true;
      this.userForm.patchValue({
        UserName: this.data?.userData.UserName || '',
        Designation: this.data?.userData.Designation || '',
        Email: this.data?.userData.Email || '',
        Role: this.data?.userData.Role || '',
        MobileNo: this.data?.userData.MobileNo || '',
      });

      const locationData = Array.isArray(this.data?.userData.Location)
        ? this.data.userData.Location
        : [this.data?.userData.Location];
      this.toggleLocation(locationData);
      this.cd.detectChanges(); // ✅ Ensures UI updates immediately
    }
  }

  addUserSuccesfully() {
     if (this.userForm.valid) {
      console.log("User Added:", this.userForm.value);
    } else {
      console.log("Form is invalid!");
    }
    this.apiService
      .signupUsers(
        this.userForm.value.UserName,
        'defaultPassword123',
        this.userForm.value.Designation,
        this.userForm.value.Email,
        this.userForm.value.Role || 'User',
        this.userForm.value.MobileNo,
        this.userForm.value.Status || 'A',
        this.userForm.value.Location
      )
      .subscribe({
        next: (res: any) => {
          this.userAdded.emit(res);
          this.dialogRef.close(true);
          this.showSuccessSnackbar('🎉 User added successfully!');
        },
        error: this.handleError,
      });
  }
  editUserSuccesfully() {
    // console.log("🛡️ Role before API request:", this.userForm.value.role);
    this.apiService
      .updateUser(this.data.userData._id, this.userForm.value)

      .subscribe({
        next: (res: any) => {
          this.userAdded.emit(res);
          this.dialogRef.close(true);
          this.showSuccessSnackbar('✅ User updated successfully!');
        },
        error: this.handleError,
      });
  }
  showSuccessSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['success-snackbar'],
    });
  }

  handleError = (err: any) => {
    this.errorMessage =
      err.status === 400 && err.error.message.includes('Email already in use')
        ? '⚠️ This email is already registered!'
        : '❌ Failed to process request. Please try again.';
  };

  filterLocations() {
    this.filteredLocations = this.allLocations.filter((loc) =>
      loc.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(
        (l) => l !== location
      );
    } else {
      this.selectedLocations.push(location);
    }
    this.userForm.patchValue({ Location: this.selectedLocations.join(', ') });
  }
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.relative')) {
      this.dropdownOpen = false;
    }
  }
  removeLocation(location: string) {
    this.selectedLocations = this.selectedLocations.filter(
      (l) => l !== location
    );
    this.userForm.patchValue({ Location: this.selectedLocations.join(', ') });
  }
  closePopup() {
    this.dialogRef.close();
  }
}
