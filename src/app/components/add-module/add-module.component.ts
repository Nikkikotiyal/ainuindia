import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-module',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './add-module.component.html',
  styleUrl: './add-module.component.scss',
})
export class AddModuleComponent {
  isEditing = false;
  errorMessage: string = '';
  @Output() moduleAdded = new EventEmitter<any>();
  moduleForm: FormGroup;
  modules: any[] = [];
  constructor(
    private fb: FormBuilder, // ✅ Inject FormBuilder
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddModuleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.moduleForm = this.fb.group({
      Moduleid: ['', [Validators.required]],
      'MODLE NAME ': ['', [Validators.required]], // ✅ Space included
      'REPORT NAME': ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    if (this.data) {
      this.isEditing = true;
      this.moduleForm.patchValue(this.data); // ✅ Prefill form fields
    }
  }
  // showAddModulePopup
  showAddModulePopup: boolean = false;

  // openPopup() {
  //   this.showAddModulePopup = true;
  // }

  closePopup() {
    this.dialogRef.close();
  }
  addModuleSuccesfully() {
    this.apiService.addModule(this.moduleForm.value).subscribe({
      next: (response: any) => {
        console.log('✅ Raw API Response:', response); // ✅ Debug API response format

        if (response && response.data) {
          console.log('✅ Module Data:', response.data);
          this.modules.push(response.data); // ✅ Push correct data format
        } else {
          console.log(
            "❌ API response does not contain 'data', using fallback:",
            response
          );
          this.modules.push(response); // ✅ Use full response if 'data' key is missing
        }

        this.dialogRef.close(true);
        this.showSuccessSnackbar('🎉 Module added successfully!');
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = error.error?.error || 'Module ID already exists!';
        } else {
          this.errorMessage = 'Something went wrong! Please try again.';
        }
      },
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

  editModuleSuccesfully() {
    if (this.moduleForm.invalid) return;

    const updatedData = this.moduleForm.getRawValue(); // get values even if Moduleid is disabled

    this.apiService.updateModule(updatedData).subscribe({
      next: (res: any) => {
        console.log('✅ Module Updated:', res);
        this.dialogRef.close(true); // Notify parent to refresh table
      },
      error: (err) => {
        console.error('❌ Error Updating Module:', err);
        this.errorMessage =
          err.error?.error || 'Update failed. Please try again.';
      },
    });
  }
}
