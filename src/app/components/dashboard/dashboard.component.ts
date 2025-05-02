import {
  Component,
  AfterViewInit,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
// import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { UserViewComponent } from '../user-view/user-view.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { UserModuleComponent } from '../user-module/user-module.component';
// import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  styleUrls: ['./dashboard.component.scss'], // Uncomment if needed
})
export class DashboardComponent implements AfterViewInit {
  isSidebarOpen = false;
  modules: any[] = [];
  users: any[] = []; // ✅ Declare the 'users' property
  selectedRecord: any = null;
  selectedUser: any = null;
  paginatedModules: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  // private activeDialog: any;
  showNewPage = true;
  showUserList = false;
  activePage = 'dashboard';
  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}


  ngOnInit() {
    // this.updatePagination();
    // ✅ Fetch users when the component initializes
    this.apiService.getUsers().subscribe(
      (data: any) => {
        this.users = data; // ✅ Assign response to the 'users' array
        this.updatePagination();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  ngAfterViewInit() {

  }

  logout() {
    // Add any logout logic (e.g., clearing localStorage/sessionStorage)
    localStorage.clear();
    console.log('click');
    // Navigate to the login page
    this.router.navigate(['']);
  }

  openUserList() {
    this.showUserList = true;
    this.isSidebarOpen = false; // 👉 Sidebar ko band karo
  }
  closeUserList() {
    this.showUserList = false; // ✅ Hide table when needed
    this.showNewPage = true; // ✅ Show dashboard again
  }

  openAddUserDialog() {
    // ✅ Directly open the AddUserComponent without closing dialogRef
    this.dialog.open(AddUserComponent, {
      width: '600px',
      disableClose: true,
    });
  }

  openModule(user: any) {
    // this.dialogRef.close();
    this.dialog.open(UserModuleComponent, {
      width: '100%',
      disableClose: true,
      data: { record: user }, // 🔸 Important
    });
  }
  updatePagination() {
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.users = this.users.slice(start, end);

    this.cdRef.detectChanges(); // ✅ Force UI refresh immediately
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
    this.paginatedModules.forEach((mod) => (mod.selected = checked));
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  resetDashboard() {
    this.showUserList = false; // Close user list
    this.isSidebarOpen = false; // Ensure sidebar is hidden
    this.cdr.detectChanges();
  }

}
