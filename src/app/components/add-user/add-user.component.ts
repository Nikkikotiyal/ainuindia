// import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { ApiService } from '../../api.service';
// import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// @Component({
//   selector: 'app-add-user',
//   standalone: true,
//   imports: [FormsModule, CommonModule,MatSnackBarModule,ReactiveFormsModule],
//   templateUrl: './add-user.component.html',
//   styleUrl: './add-user.component.scss',
//   encapsulation: ViewEncapsulation.None
// })
// export class AddUserComponent {

// userForm = new FormGroup({
//   UserName: new FormControl(''),
//   Email: new FormControl(''),
//   MobileNo: new FormControl(''),
//   Designation: new FormControl(''),
//   Status: new FormControl('A'),
//   Location: new FormControl([]),
// });
//   @Output() userAdded = new EventEmitter<void>();
//   errorMessage: string = '';
//   dropdownOpen: boolean = false;
//   searchText: string = '';
//   allLocations: string[] = [
//     'Banjara Hills',
//     'Dilsukhnagar',
//     'HITECH city',
//     'Visakhapatnam',
//     'Siliguri',
//     'Secunderabad',
//     'Chennai',
//   ];

//   isEditMode = false;
//   selectedLocations: string[] = [];
//   filteredLocations: string[] = [...this.allLocations];
//   showToaster: boolean = false; // ✅ Initialize property
//   userForm: any;
//   constructor(
//     private fb: FormBuilder, // ✅ Inject FormBuilder
//     private dialogRef: MatDialogRef<AddUserComponent>,
//     private apiService: ApiService,
//     private snackBar: MatSnackBar,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private cd: ChangeDetectorRef
//   ) {
//     this.userForm = this.fb.group({
//       username: [''],
//       designation: [''],
//       email: [''],
//       role: ['User'],
//       mobileNo: [''],
//       status: ['A'],
//       location: [''],
//     });
//   }

//   ngOnInit(): void {
//     console.log('🧐 Debugging Full Data Object:', JSON.stringify(this.data, null, 2));
//     console.log('🧐 Debugging User Object:', JSON.stringify(this.data?.user, null, 2));

//     this.isEditMode = !!this.data?.user;

//     if (this.isEditMode && this.data?.user) {
//       console.log('🛠 Before Patching Form Data:', this.userForm.value);
//       this.userForm.patchValue({
//         username: this.data.user?.UserName || '',
//         email: this.data.user?.Email || '',
//         mobileNo: this.data.user?.MobileNo || '',
//         designation: this.data.user?.Designation || '',
//         status: this.data.user?.Status || 'A',
//         location: this.data.user?.Location || '',
//       });

//       this.selectedLocations = this.data.user?.Location ? this.data.user.Location.split(', ') : [];
//       console.log('✅ Locations:', this.selectedLocations);
//       console.log('✅ After Patching Form Data:', this.userForm.value);
//       this.cd.detectChanges(); // 🔄 Force UI update
//     }
//   }

//   addUserSuccesfully() {
//     console.log('📝 Form Data Before Sending:', this.userForm.value);

//     if (this.isEditMode) {
//       this.apiService.updateUser(this.data.user._id, this.userForm.value).subscribe({
//         next: (res: any) => {
//           console.log('✅ User updated successfully:', res);
//           this.userAdded.emit(res);
//           this.dialogRef.close(true);
//           this.showSuccessSnackbar('✅ User updated successfully!');
//         },
//         error: this.handleError,
//       });
//     } else {
//       this.apiService.signupUsers(
//         this.userForm.UserName, // Should be 'username' in backend
//         'defaultPassword123',
//         this.userForm.Designation, // Correctly passed
//         this.userForm.Email, // Correctly passed
//         this.userForm.role || 'User', // Correctly passed or defaulted
//         this.userForm.MobileNo, // Should be 'mobileNo' in backend
//         this.userForm.Status || 'A', // Default if not passed
//         this.userForm.Location
//       ).subscribe({
//         next: (res: any) => {
//           console.log('✅ User added successfully:', res);
//           this.userAdded.emit(res);
//           this.dialogRef.close(true);
//           this.showSuccessSnackbar('🎉 User added successfully!');
//         },
//         error: this.handleError,
//       });
//     }
//   }

//   showSuccessSnackbar(message: string) {
//     this.snackBar.open(message, 'Close', {
//       duration: 4000,
//       verticalPosition: 'top',
//       horizontalPosition: 'right',
//       panelClass: ['success-snackbar'],
//     });
//   }

//   handleError = (err: any) => {
//     console.error('❌ Error saving user:', err);
//     this.errorMessage = err.status === 400 && err.error.message.includes('Email already in use')
//       ? '⚠️ This email is already registered!'
//       : '❌ Failed to process request. Please try again.';
//   };

//   filterLocations() {
//     this.filteredLocations = this.allLocations.filter((loc) =>
//       loc.toLowerCase().includes(this.searchText.toLowerCase())
//     );
//   }

//   toggleLocation(location: string) {
//     if (this.selectedLocations.includes(location)) {
//       this.selectedLocations = this.selectedLocations.filter(
//         (l) => l !== location
//       );
//     } else {
//       this.selectedLocations.push(location);
//     }

//     // ✅ Ensure `formData.Location` is updated correctly
//     this.userForm.Location = this.selectedLocations.join(', ');
//     console.log('Updated Location:', this.userForm.Location); // 🔍 Debugging check
//   }

//   removeLocation(location: string) {
//     this.selectedLocations = this.selectedLocations.filter(
//       (l) => l !== location
//     );
//   }
// }
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../api.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
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
      UserName: [''],
      Designation: [''],
      Email: [''],
      role: ['User'],
      MobileNo: [''],
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
        Location: this.data?.userData.Location || '',
      });
    }

    this.cd.detectChanges();
    // },
    // error: (err) => {
    //   console.error("❌ API Error:", err);
    // }
    // });
  }

  addUserSuccesfully() {
    this.apiService
      .signupUsers(
        this.userForm.value.UserName,
        'defaultPassword123',
        this.userForm.value.Designation,
        this.userForm.value.Email,
        this.userForm.value.role || 'User',
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
    // if (this.isEditing) {
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
    // }
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

  removeLocation(location: string) {
    this.selectedLocations = this.selectedLocations.filter(
      (l) => l !== location
    );
    this.userForm.patchValue({ Location: this.selectedLocations.join(', ') });
  }
}
