import {
  Component,
  AfterViewInit,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { AddUserComponent } from '../add-user/add-user.component';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule, MatSnackBarModule],
  styleUrls: ['./dashboard.component.scss'], // Uncomment if needed
})
export class DashboardComponent implements AfterViewInit {
  data: any[] = [];
  isSidebarOpen = false;
  modules: any[] = [];
  checkedModules: any[] = [];
  users: any[] = []; // ✅ Declare the 'users' property
  // selectedRecord: any = null;
  selectedUser: any = null;

  // currentPage = 1;
  // itemsPerPage = 10;
  // totalPages = 1;
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
  public loggedIn: boolean = false;
  formData: any = {};
  buttonLabel: string = 'Edit';
  // selectedModuleNames: string[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef // @Inject(PLATFORM_ID) private platformId: Object, // @Inject(MAT_DIALOG_DATA) public userData: any
  ) {}

  ngOnInit(): void {
    const storedLocation = localStorage.getItem('userLocation');
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        this.userEmail = parsed?.user?.Email || 'No email';
        this.chosenLocation = parsed?.user?.Location || 'No location';
      }
    }

    this.selectedUser = this.data.length > 0 ? this.data[0] : null;
    this.apiService.getUsers().subscribe(
      (data: any) => {
        this.users = data;
        console.log('userdata', this.users);
        this.users = data;
        const User = data.find(
          (user: { Role: string }) => user.Role === 'User'
        );
        this.user = User ? User.Email : 'No user Found';
        this.chosenLocation = storedLocation
          ? storedLocation
          : User?.Location || 'Default Location';
        // console.log(User?.Location);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );

    this.apiService.getModules().subscribe(
      (data: any) => {
        console.log('Data from API:', data);
        this.modules = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  statusMap: any = {
    A: 'Active',
    I: 'Inactive',
    S: 'Suspended',
  };

  ngAfterViewInit() {}
  logout() {
    localStorage.removeItem('token'); // Remove stored authentication token
    sessionStorage.clear(); // Clear all session data if needed

    this.router.navigate(['']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
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

    // Step 1: First, fetch ALL modules
    this.apiService.getUserModulesByUserID(user._id).subscribe(
      (data: any) => {
        const selectedModuleIds =
          data?.modules?.map((m: { Moduleid: any }) => m.Moduleid) || [];

        this.modules.forEach((module) => {
          module.selected = selectedModuleIds.includes(module.Moduleid);
        });

        this.cdRef.detectChanges();
      },
      (error) => {
        if (error.status === 404) {
          // No selected modules — just mark all as unselected
          this.modules.forEach((module) => {
            module.selected = false;
          });
          console.warn(
            'No modules found for this user — showing all unchecked.'
          );
          this.cdRef.detectChanges(); // Update the view
        } else {
          console.error('Error fetching user modules:', error);
        }
      }
    );
  }

  // updatePagination() {
  // this.totalPages = Math.ceil(this.modules.length / this.itemsPerPage);
  // const start = (this.currentPage - 1) * this.itemsPerPage;
  // const end = start + this.itemsPerPage;
  // this.users = this.users.slice(start, end);
  // this.paginatedModules = this.modules.slice(start, end);
  // }

  // nextPage() {
  //   if (this.currentPage < this.totalPages) {
  //     this.currentPage++;
  //     this.updatePagination();
  //   }
  // }

  // prevPage() {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     this.updatePagination();
  //   }
  // }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.modules.forEach((mod) => (mod.selected = checked));
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
    this.users = this.users.filter(
      (user) =>
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

  submitCheckedData() {
    const selectedModules = this.modules.filter((m) => m.selected);

    if (selectedModules.length === 0) {
      alert('Please select at least one module.');
      return;
    }

    const payload = {
      userId: this.selectedUser._id,
      modules: selectedModules,
    };

    this.apiService.saveModules(payload).subscribe({
      next: (res) => {
        this.showUserList = true;
        this.showModuleList = false;
        console.log('✅ Modules saved successfully!');
        const snackRef = this.snackBar.open(
          'Modules saved successfully!',
          'Close',
          {
            duration: 4000,
            verticalPosition: 'top',
            horizontalPosition: 'right',
            panelClass: ['success-snackbar'],
          }
        );

        // ✅ Apply styles correctly
        setTimeout(() => {
          const overlayContainer = document.querySelector(
            '.cdk-overlay-container'
          ) as HTMLElement;
          if (overlayContainer) {
            const snackElement = overlayContainer.querySelector(
              '.mat-mdc-snack-bar-container'
            ) as HTMLElement;
            if (snackElement) {
              console.log('✅ Snackbar element found inside OverlayContainer!');
              snackElement.style.setProperty(
                'background',
                'green',
                'important'
              );
              snackElement.style.setProperty('color', 'white', 'important');
            } else {
              console.error('❌ Snackbar element NOT found inside overlay!');
            }
          } else {
            console.error('❌ Overlay container NOT found!');
          }
        }, 500);
      },
      error: (err) => {
        console.error('❌ Failed to save modules', err);

        // 🔴 Show ERROR message in snackbar
        this.snackBar.open('❌ Error saving modules!', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  BackToView() {
    this.showUserList = true;
    this.showModuleList = false;
  }
  // isModuleActive(name: string): boolean {
  //   return this.selectedModuleNames?.includes(name) || false;
  // }
  editUserModuleList(user: any) {
    console.log('🛠 Debugging Selected User:', user);
    console.log('🔄 Available Keys in User:', Object.keys(user || {}));
    // console.log('📢 Extracted User ID:', user?._id || user?.userId);

    // if (!user?._id) {
    //   console.error("❌ No valid user ID found! Check user object structure.");
    //   return;
    // }

    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '600px',
      disableClose: false,
      data: { userData: user },
    });

    console.log('📢 User ID Sent to Dialog:', user._id);
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

  refreshUserList() {
    this.apiService.getUsers().subscribe((data: any) => {
      this.users = [...data];
      console.log('Updated Users:', this.users);
    });
  }
}
