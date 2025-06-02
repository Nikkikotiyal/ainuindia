import {
  Component,
  AfterViewInit,
  Inject,
  ChangeDetectorRef,
  HostListener,
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
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ProfileComponent } from '../profile/profile.component';
import { log } from 'node:console';
import { DeleteConfirmationPopupComponent } from '../delete-confirmation-popup/delete-confirmation-popup.component';
import { ModuleService } from '../ModuleService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule, MatSnackBarModule],
  styleUrls: ['./dashboard.component.scss'], // Uncomment if needed
})
export class DashboardComponent implements AfterViewInit {
  private baseUrl = 'http://localhost:3000/api';
  iconMapping: { [key: string]: string } = {
    ADT: 'fas fa-hospital fa-2x',
    'A/R': 'fas fa-credit-card fa-2x',
    'ASSET MANAGEMENT': 'fas fa-boxes-stacked fa-2x',
    BILLING: 'fas fa-file-invoice-dollar fa-2x',
    'DAY CARE': 'fas fa-procedures fa-2x',
    EMERGENCY: 'fa-solid fa-ambulance fa-2x',
    'FRONT OFFICE': 'fa-solid fa-concierge-bell fa-2x',
    'GENERAL ITEMS': 'fa-solid fa-box-open fa-2x',
    INVENTORY: 'fa-solid fa-warehouse fa-2x',
    LAB: 'fa-solid fa-flask fa-2x',
    MIS: 'fa-solid fa-chart-bar fa-2x',
    MRD: 'fa-solid fa-folder fa-2x',
    NURSING: 'fa-solid fa-user-nurse fa-2x',
    OT: 'fa-solid fa-procedures fa-2x',
    PHARMACY: 'fa-solid fa-capsules fa-2x',
    'SAMPLE COLLECTION': 'fa-solid fa-vial fa-2x',
  };
  secondDashVisible: boolean = false;
  isDashVisible: boolean = false;
  isBillingDashVisible: boolean = false;
  isAdtReportVisible: boolean = false;
  errorMessage: string = '';
  userModules: any[] = [];
  userId: string = '';
  data: any[] = [];
  filteredModules: any[] = [];
  distinctModules: any[] = [];
  filteredReports: any[] = [];
  isSidebarOpen = false;
  modules: any[] = [];
  checkedModules: any[] = [];
  users: any[] = []; // ✅ Declare the 'users' property
  // selectedRecord: any = null;
  selectedUser: any = null;
  darkModeEnabled = false;
  // currentPage = 1;
  // itemsPerPage = 10;
  // totalPages = 1;
  showUserList = false;
  showModuleList = false;
  superAdminEmail: string = '';
  activePage = 'dashboard';
  user: any = {};
  softwareName = 'Default Software';
  softwareIcon = 'fas fa-question-circle'; // Default icon
  chosenLocation: any = {};
  userEmail: string = '';
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  public loggedIn: boolean = false;
  formData: any = {};
  buttonLabel: string = 'Edit';
  originalUsers: any[] = [];
  // selectedModuleNames: string[] = [];
  isLoginInfo: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private moduleService: ModuleService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef // @Inject(PLATFORM_ID) private platformId: Object, // @Inject(MAT_DIALOG_DATA) public userData: any
  ) {}

  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = userData._id || '';
    console.log('✅ Retrieved userId:', this.userId); // ✅ Retrieve user ID

    if (!this.userId) {
      console.error('❌ No user ID found in localStorage!');
      return;
    }

    console.log(`🔄 User ID from localStorage: ${this.userId}`);
    this.fetchUsers();
    // const savedDarkMode = JSON.parse(localStorage.getItem("darkMode") || "false");
    // if (savedDarkMode) {
    //   document.body.classList.add("dark-mode");
    //   this.darkModeEnabled = true;
    // }

    const storedLocation = localStorage.getItem('userLocation');
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        this.userEmail = parsed?.Email || 'No email';
        //  this.userEmail = parsed?.user?.Email || 'No email';
        console.log('userEmail', userDataStr);
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
    localStorage.removeItem('token'); // ✅ Remove authentication token
    localStorage.removeItem('userLocation'); // ✅ Remove stored location
    localStorage.removeItem('userEmail'); // ✅ Remove stored email
    localStorage.clear(); // ✅ Full localStorage cleanup (optional)
    this.router.navigate(['']); // ✅ Redirect to login page
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  // 3rd dashboard
  showModuleDashboard(userId: string, moduleName: string) {
    this.isDashVisible = true;
    this.showUserList = false;
    this.secondDashVisible = false;

    if (!userId) {
      console.error('❌ No userId found!');
      return;
    }
    this.apiService.getDashUserModulesByUserID(userId).subscribe({
      next: (response) => {
        console.log(
          '📦 Raw API Response:',
          JSON.stringify(this.userModules, null, 2)
        );

        this.userModules.forEach((module) => {
          console.log(
            '📌 ModuleDetails Keys:',
            Object.keys(module.moduleDetails)
          );
          console.log('🔍 MODLE NAME:', module.moduleDetails?.['MODLE NAME ']);
          console.log(
            '📑 REPORT NAME:',
            module.moduleDetails?.['REPORT_NAME ']
          );
        });

        this.userModules = response.modules;
        console.log('✅ Retrieved Modules:', this.userModules);
        const moduleNames = this.userModules.map((module) =>
          module.moduleDetails?.['MODLE NAME ']?.trim()
        );
        // console.log('📌 Module Names:', moduleNames);

        // ✅ Extract reports only for the selected module
        this.filteredReports = this.userModules
          .filter((module) => {
            if (!module.moduleDetails) return false;

            const modName = module.moduleDetails?.['MODLE NAME ']?.trim();
            return (
              modName && modName.toLowerCase() === moduleName.toLowerCase()
            );
          })
          .map((module) => ({
            MODLE_NAME:
              module.moduleDetails?.['MODLE NAME ']?.trim() || 'Unknown Module',
            REPORT_NAME:
              module.moduleDetails?.['REPORT NAME']?.trim() ||
              'No Report Available',
          }));
        console.log(
          `📑 Final Filtered Reports for ${moduleName}:`,
          this.filteredReports
        );
      },
      error: (error) => {
        console.error('❌ API Error:', JSON.stringify(error, null, 2));
      },
    });
  }

  // 2nd dashboard
  showTrioDashboard(name: string, userId: string) {
    this.softwareName = name;
    this.softwareIcon = name === 'TRIOTREE' ? 'fas fa-tree' : 'fas fa-bolt';
    this.secondDashVisible = true; // ✅ Ensure dashboard is visible on click
    this.showUserList = false;
    this.isDashVisible = false;
    if (!userId) {
      console.error('❌ No userId found!');
      return;
    }

    this.apiService.getDashUserModulesByUserID(userId).subscribe({
      next: (response) => {
        this.userModules = response.modules;
        // console.log('✅ Retrieved Modules:', this.userModules);

        // ✅ Extract and store distinct modules
        const moduleMap = new Map();
        this.userModules.forEach((module) => {
          if (!module.moduleDetails) return; // Safety check

          // Find dynamic key for 'MODLE NAME' (ignoring case and spaces)
          const keys = Object.keys(module.moduleDetails);
          const modleNameKey = keys.find(
            (key) => key.replace(/\s/g, '').toUpperCase() === 'MODLENAME'
          );

          // Get modleName value from dynamic key
          const modleName = modleNameKey
            ? module.moduleDetails[modleNameKey]?.trim().toUpperCase()
            : null;

          if (modleName && !moduleMap.has(modleName)) {
            moduleMap.set(modleName, module);
          }
        });

        this.distinctModules = Array.from(moduleMap.values());
        // console.log('🔎 Fixed Distinct Modules:', this.distinctModules);
      },
      error: (error) => {
        console.error('❌ API Error:', error);
      },
    });
  }
  //4th dashboard
  showAdtAdmission() {
    this.isDashVisible = false;
    this.isAdtReportVisible=true;
    console.log('clicked');
  }
  goBackSecondDash() {
    this.secondDashVisible = true;
    this.isDashVisible = false;
  }
  goBackThirdDash(){
     this.isDashVisible = true;
    this.isAdtReportVisible=false;
  }
  goBackfirstDash() {
    this.secondDashVisible = false;
    // this.isDashVisible = true;
    // this.secondDashVisible = false;
  }
  showInstaDashboard(name: string) {
    this.softwareIcon = name === 'TRIOTREE' ? 'fas fa-tree' : 'fas fa-bolt';
    this.softwareName = name;
  }

  billingDetails() {
    console.log('clicked');
    this.isDashVisible = false;
    this.isBillingDashVisible = !this.isBillingDashVisible;
  }

  showModuleDetails(moduleName: string) {
    console.log(`🔄 Navigating to details for: ${moduleName}`);
  }
  openUserList() {
    this.secondDashVisible = false;
    this.showUserList = true;
    this.isSidebarOpen = false;
    this.showModuleList = false;
    this.isSidebarOpen = true;
    this.isDashVisible = false;
    this.cdRef.detectChanges(); // ✅ Forces UI update
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
    this.isSidebarOpen = true;
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
    this.isSidebarOpen = true;
    this.isDashVisible = false;
    this.showModuleList = false;
    this.isBillingDashVisible = false;
    this.secondDashVisible = false;
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.users = [...this.originalUsers]; // ✅ Reset full list when search is empty
      return;
    }

    this.users = this.originalUsers.filter(
      (user) =>
        user.UserName.toLowerCase().includes(term) ||
        user.Email.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.users = [...this.originalUsers]; // ✅ Restore full user list
  }

  fetchUsers() {
    this.apiService.getUsers().subscribe((data) => {
      this.users = data; // Display filtered users
      this.originalUsers = [...data]; // Store original list for reset
    });
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

  loginInfo(event: Event) {
    event.stopPropagation();
    this.isLoginInfo = !this.isLoginInfo;
    console.log('open userinfo');
  }

  viewProfile() {
    const dialogRef = this.dialog.open(ProfileComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(() => {});
  }

  changePassword() {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(() => {});
    console.log('Change password clicked!'); // ✅ Implement password change logic
  }

  @HostListener('document:click')
  onClickOutside() {
    this.isLoginInfo = false; // ✅ Close dropdown if clicked outside
  }
  viewUser(user: any) {
    // View logic here
  }

  deleteUser(userId: string) {
    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteUser(userId).subscribe(() => {
          this.showSuccessSnackbar('✅ User deleted successfully!');
          this.fetchUsers(); // Reload active users after soft deletion
        });
      }
    });
  }

  showSuccessSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['success-snackbar'],
    });
  }

  getIconClass(moduleName: string): string {
    if (!moduleName) return 'fas fa-question-circle'; // ✅ Default icon for missing names

    const normalizedName = moduleName.trim().toUpperCase(); // ✅ Ensure consistent formatting
    // console.log('🔎 Checking Icon for:', normalizedName); // ✅ Debugging output

    return this.iconMapping[normalizedName] || 'fas fa-question-circle'; // ✅ Lookup with normalized key
  }

}
