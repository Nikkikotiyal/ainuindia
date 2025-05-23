import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation-popup',
  standalone: true,
  imports: [MatDialogModule, NgIf],
  templateUrl: './delete-confirmation-popup.component.html',
  styleUrl: './delete-confirmation-popup.component.scss'
})
export class DeleteConfirmationPopupComponent {
 constructor(
    private dialogRef: MatDialogRef<DeleteConfirmationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
