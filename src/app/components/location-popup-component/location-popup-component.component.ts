import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-location-popup-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-popup-component.component.html',
  styleUrls: ['./location-popup-component.component.scss'], // ✅ Fix typo (plural)
})
export class LocationPopupComponentComponent {
  constructor(
    private dialogRef: MatDialogRef<LocationPopupComponentComponent>
  ) {}

  isDropdownOpen: boolean = false;
  selectedLocation: string = ''; // ✅ Ensure this variable updates properly
  locations: string[] = [
    'Banjara Hills',
    'Dilsukhnagar',
    'HITECH city',
    'Visakhapatnam',
    'Siliguri',
    'Secunderabad',
    'Chennai',
  ];

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLocation(location: string) {
    this.selectedLocation = location; // ✅ Properly updating selectedLocation
    this.isDropdownOpen = false;
  }

  confirmLocation() {
    this.isDropdownOpen = false; // ✅ Dropdown closes when clicking "OK"
    console.log('✅ Selected Location:', this.selectedLocation);
    this.dialogRef.close();
  }
}
