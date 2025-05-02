import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { ToastrService, ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    this.forgotPasswordForm.markAllAsTouched();
    this.submitted = true;

    // Check if the form is valid before triggering the toaster
    // if (this.forgotPasswordForm.valid) {
    //   // Trigger the success toaster notification
    //   this.toastr.success('Please check your e-mail for reset instructions.', 'Success');
    // } else {
    //   // Trigger an error toaster notification
    //   this.toastr.error('Invalid email. Please provide a valid email address.', 'Error');
    // }
  }
}
