import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-location-popup-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-popup-component.component.html',
  styleUrls: ['./location-popup-component.component.scss'] // ✅ Fix typo (plural)
})
export class LocationPopupComponentComponent {
  constructor(private dialogRef: MatDialogRef<LocationPopupComponentComponent>) {}

  selectedLocations: Record<string, boolean> = {
    Banjara_Hills: false,
    Dilsukhnagar: false,
    HITECH_city: false,
    Visakhapatnam: false,
    Siliguri: false,
    Secunderabad: false,
    Chennai: false,
  };


  chosenLocation: string = '';

  confirmLocation() {
    const selected = Object.keys(this.selectedLocations).filter(loc => this.selectedLocations[loc]);
    const chosenLocation = selected.length ? selected[0] : 'No Location Selected';

    console.log('✅ User Selected Location:', chosenLocation);

    this.dialogRef.close(chosenLocation); // ✅ Pass selected location on close
  }

  closePopup() {
    this.dialogRef.close();
  }
}
