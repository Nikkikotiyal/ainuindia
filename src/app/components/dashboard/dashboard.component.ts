import {
  Component,
  AfterViewInit,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddUserComponent } from '../add-user/add-user.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  styleUrls: ['./dashboard.component.scss'], // Uncomment if needed
})
export class DashboardComponent implements AfterViewInit {
  data: any[] = [];
  isSidebarOpen = false;
  modules: any[] = [];
  users: any[] = []; // ✅ Declare the 'users' property
  // selectedRecord: any = null;
  selectedUser: any = null;
  paginatedModules: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  showUserList = false;
  showModuleList = false;
  superAdminEmail: string = '';
  activePage = 'dashboard';
  user: any = {};
  chosenLocation:  any = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.selectedUser = this.data.length > 0 ? this.data[0] : null;
    this.apiService.getUsers().subscribe(
      (data: any) => {

        this.users = data;
        const superAdmin = data.find((user: { Role: string; }) => user.Role === 'SuperAdmin');
        this.user = superAdmin ? superAdmin.Email : 'No SuperAdmin Found';
        console.log('Extracted SuperAdmin Email:', this.user); // 🔍 Debugging
        this.chosenLocation = superAdmin?.Location || 'Location Not Selected';
        this.updatePagination();

      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );



    this.apiService.getModules().subscribe(
      (data: any) => {
        console.log('Data from API:', data);
        this.modules = data;
        this.updatePagination();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  ngAfterViewInit() {}

  logout() {
    // Add any logout logic (e.g., clearing localStorage/sessionStorage)
    localStorage.clear();
    console.log('click');
    // Navigate to the login page
    this.router.navigate(['']);
  }

  openUserList() {
    this.showUserList = true;
    this.isSidebarOpen = false;
    this.showModuleList = false;
  }
  closeUserList() {
    this.showUserList = false;
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog closed with:', result);

        this.apiService.getUsers().subscribe((data: any) => {
          this.users = data; // ✅ Assign response to the `users` array
          console.log('Updated Users:', this.users);
        });
      }
    });
  }

  openModuleList(user: any) {

    this.showModuleList = true;
    this.showUserList = false;
    this.isSidebarOpen = false;
    this.selectedUser = user;
    console.log('Selected User:', this.selectedUser);
    this.cdRef.detectChanges();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.modules.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.users = this.users.slice(start, end);
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
    this.paginatedModules.forEach((mod) => (mod.selected = checked));
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  resetDashboard() {
    this.showUserList = false;
    this.isSidebarOpen = false;
    this.cdr.detectChanges();
  }
}
