import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-module.component.html',
  styleUrl: './user-module.component.scss',
})
export class UserModuleComponent implements OnInit {
  modules: any[] = [];              // All modules
  paginatedModules: any[] = [];     // Modules shown on current page
  selectedRecord: any;              // User record passed from dialog

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<UserModuleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.selectedRecord = this.data.record;

    this.apiService.getModules().subscribe((data) => {
      console.log('Data from API:', data);
      this.modules = data;
      this.updatePagination(); // ✅ apply pagination after data loads
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.modules.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedModules = this.modules.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.paginatedModules.forEach(mod => mod.selected = checked);
  }
}
