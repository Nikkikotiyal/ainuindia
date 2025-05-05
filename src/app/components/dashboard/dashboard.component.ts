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
  chosenLocation: any = {};
  userEmail: string = '';
  searchTerm: string = '';
  sortColumn: string = '';
sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      this.userEmail = loggedInUser.Email || '';
      console.log('logged user', this.userEmail);
    }
    this.selectedUser = this.data.length > 0 ? this.data[0] : null;
    this.apiService.getUsers().subscribe(
      (data: any) => {
        this.users = data;
        console.log('userdata', this.users);
        this.users = data;
        this.userEmail = this.users[0].Email;
        const superAdmin = data.find(
          (user: { Role: string }) => user.Role === 'SuperAdmin'
        );
        this.user = superAdmin ? superAdmin.Email : 'No SuperAdmin Found';
        this.chosenLocation = superAdmin?.Location ?? 'Default Location';
        console.log(superAdmin?.Location);
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

  statusMap: any = {
    'A': 'Active',
    'I': 'Inactive',
    'S': 'Suspended'
  };

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
          this.users = [...this.users];
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

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();
    this.users = this.users.filter(user =>
      user.UserName.toLowerCase().includes(term) ||
      user.Email.toLowerCase().includes(term)
    );
  }
  clearSearch() {
    this.searchTerm = '';
    this.users = [...this.users];
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.users.sort((a, b) => {
      const valA = a[column]?.toString().toLowerCase() || '';
      const valB = b[column]?.toString().toLowerCase() || '';

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
