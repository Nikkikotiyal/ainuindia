import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  private fb = inject(FormBuilder);
  errorMessage: string = '';
  successMessage: string = '';
  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {
    this.changePasswordForm = this.fb.group(
      {
        // email: ['', [Validators.required]],
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordsMatch }
    );
  }

  passwordsMatch(group: FormGroup) {
    return group.get('newPassword')?.value ===
      group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  updatePassword() {
    this.apiService
      .changePassword({
        // email: this.changePasswordForm.get('email')?.value,
        currentPassword: this.changePasswordForm.get('currentPassword')?.value,
        newPassword: this.changePasswordForm.get('newPassword')?.value,
        confirmPassword: this.changePasswordForm.get('confirmPassword')?.value,
      })
      .subscribe({
        next: (res: any) => {
          this.successMessage = res.message;
          this.errorMessage = '';
          this.dialogRef.close(true);
          // ✅ Show Success Snackbar
          this.snackBar.open('✅ Password Changed Successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        },
        error: (err: any) => {
          this.errorMessage = err.error.message || '❌ Something went wrong!';
          this.successMessage = '';

          // ❌ Show Error Snackbar
          this.snackBar.open('❌ ' + this.errorMessage, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }
  closePopup(){
    this.dialogRef.close();
  }
}
