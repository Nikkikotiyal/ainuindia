import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-location-popup-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-popup-component.component.html',
  styleUrls: ['./location-popup-component.component.scss'],
})
export class LocationPopupComponentComponent {
  @Output() locationChanged = new EventEmitter<string>();
  constructor(
    private apiService: ApiService,
    private dialogRef: MatDialogRef<LocationPopupComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defaultLocation: string[] }
  ) {
    console.log('📌 Received Locations in Popup:', data.defaultLocation);
    this.locations = Array.isArray(data.defaultLocation)
      ? data.defaultLocation
      : ['Default Location'];
    this.selectedLocation = this.locations.length ? this.locations[0] : '';
  }
  isDropdownOpen: boolean = false;
  selectedLocation: string = '';
  users: any[] = [];
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
    if (this.selectedLocation) {
      localStorage.setItem('userLocation', this.selectedLocation);

      this.dialogRef.close(this.selectedLocation);
      window.location.reload();
      this.locationChanged.emit(this.selectedLocation);
      this.apiService.getUsersByLocation(this.selectedLocation).subscribe(
        (data: any) => {
          this.users = data;
        },
        (error) => {
          console.error('❌ Error fetching users:', error);
        }
      );
    }
  }
}
