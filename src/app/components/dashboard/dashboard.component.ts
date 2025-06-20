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
import { AddModuleComponent } from '../add-module/add-module.component';
import { HttpHeaders } from '@angular/common/http';

const normalizeText = (text: string) =>
  text.replace(/\s+/g, ' ').trim().toLowerCase();

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule, MatSnackBarModule],
  styleUrls: ['./dashboard.component.scss'], // Uncomment if needed
})
export class DashboardComponent implements AfterViewInit {
  breadcrumbs: string[] = ['Welcome To Document Management Software : AINU']; // ✅ Breadcrumbs Variable Defined
  normalizeText(text: string) {
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }
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
  filteredLogs: any[] = [];
  logs: any[] = [];
  secondDashVisible: boolean = false;
  isDashVisible: boolean = false;
  isBillingDashVisible: boolean = false;
  isAdtReportVisible: boolean = false;
  admissionDashVisible: boolean = false;
  admissionviewDashVisible: boolean = false;
  isSideModuleVisible: boolean = false;
  isLogVisible: boolean = false;
  errorMessage: string = '';
  userModules: any[] = [];
  patient: any;
  userId: string = '';
  data: any[] = [];
  originalAdtAdmissionReports: any[] = [];
  filteredReports: any[] = [];
  filteredModules: any[] = [];
  searchDistinctModuleTerm: string = '';
  distinctModules: any[] = [];
  filteredDistinctModules: any[] = [];
  searchModuleTerm: string = '';
  isSidebarOpen = false;
  // AdtAdmissionReports: any[] = [];
  modules: any[] = [];
  checkedModules: any[] = [];
  userRole: string = '';
  filteredUsers: any[] = [];
  reportSearchTerm: string = '';
  // filteredReportsByUserId: any[] = []; // Final list shown
  originalReports: any[] = []; // Unfiltered copy

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
  searchText: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  public loggedIn: boolean = false;
  formData: any = {};
  buttonLabel: string = 'Edit';
  // originalUsers: any[] = [];
  totalUsers: number = 0;

  // selectedModuleNames: string[] = [];
  isLoginInfo: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private cdr: ChangeDetectorRef // @Inject(PLATFORM_ID) private platformId: Object, // @Inject(MAT_DIALOG_DATA) public userData: any
  ) {}
  searchCriteria = {
    UHID: '',
    IPNO: '',
    patientName: '',
    location: '',
    admissionDate: '',
  };
  ngOnInit(): void {
    this.filteredLogs = this.logs; // initially show all
    this.fetchLogs();
    this.fetchUsers();
    this.fetchModules();
    // this.userRole = this.authService.getUserRole();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userId = userData._id || '';
    console.log('✅ Retrieved userId:', this.userId);
    this.userRole = userData.Role; // ✅ Retrieve user ID
    console.log('✅ Retrieved role:', this.userRole);

    if (!this.userId) {
      console.error('❌ No user ID found in localStorage!');
      return;
    }

    console.log(`🔄 User ID from localStorage: ${this.userId}`);
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
        this.modules = [...this.modules];
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
    this.updateBreadcrumb('Choose Report');
    this.isDashVisible = true;
    this.showUserList = false;
    this.secondDashVisible = false;
    this.isAdtReportVisible = false;
    this.admissionviewDashVisible = false;

    if (!userId) {
      console.error('❌ No userId found!');
      return;
    }
    this.apiService.getDashUserModulesByUserID(userId).subscribe({
      next: (response) => {
        // ✅ Step 1: Store data first
        this.userModules = response.modules;
        console.log('✅ Retrieved Modules:', this.userModules);

        // ✅ Step 2: Debug raw data
        console.log(
          '📦 Raw API Response:',
          JSON.stringify(this.userModules, null, 2)
        );

        this.userModules.forEach((module) => {
          console.log(
            '📌 ModuleDetails Keys:',
            Object.keys(module.moduleDetails || {})
          );
          console.log('🔍 MODLE NAME:', module.moduleDetails?.['MODLE NAME ']);
          console.log('📑 REPORT NAME:', module.moduleDetails?.['REPORT NAME']);
        });

        // ✅ Step 3: Extract reports for selected moduleName
        const reports = this.userModules
          .filter((module) => {
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

        // ✅ Step 4: Save original & filtered (for search)
        this.originalReports = reports;
        this.filteredReports = [...reports];

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

  // Call this after setting originalReports once
  filterReports() {
    const term = this.reportSearchTerm.toLowerCase().trim();

    this.filteredReports = !term
      ? [...this.originalReports]
      : this.originalReports.filter((report) =>
          report.REPORT_NAME.toLowerCase().includes(term)
        );
  }

  // 2nd dashboard
  showTrioDashboard(name: string, userId: string) {
    this.updateBreadcrumb('Choose Module');
    this.softwareName = name;
    this.softwareIcon = name === 'TRIOTREE' ? 'fas fa-tree' : 'fas fa-bolt';
    this.secondDashVisible = true;
    this.showUserList = false;
    this.isDashVisible = false;
    this.isAdtReportVisible = false;

    if (!userId) {
      console.error('❌ No userId found!');
      return;
    }

    this.apiService.getDashUserModulesByUserID(userId).subscribe({
      next: (response) => {
        this.userModules = response.modules;

        const moduleMap = new Map();
        this.userModules.forEach((module) => {
          if (!module.moduleDetails) return;

          const keys = Object.keys(module.moduleDetails);
          const modleNameKey = keys.find(
            (key) => key.replace(/\s/g, '').toUpperCase() === 'MODLENAME'
          );

          const modleName = modleNameKey
            ? module.moduleDetails[modleNameKey]?.trim().toUpperCase()
            : null;

          if (modleName && !moduleMap.has(modleName)) {
            moduleMap.set(modleName, { ...module, moduleName: modleName }); // ✅ Store moduleName explicitly
          }
        });

        this.distinctModules = Array.from(moduleMap.values());
        this.filteredDistinctModules = [...this.distinctModules]; // ✅ Preserve module names

        console.log(
          '✅ Loaded Modules with Names:',
          this.filteredDistinctModules
        );
      },
      error: (error) => {
        console.error('❌ API Error:', error);
      },
    });
  }

  navigateTo(section: string, label: string) {
    this.resetSections();

    // Ensure the correct section is activated
    switch (section) {
      case 'showModuleList':
        this.showModuleList = true;
        break;
      case 'showUserList':
        this.showUserList = true;
        break;
      case 'isDashVisible':
        this.isDashVisible = true;
        break;
      case 'admissionDashVisible':
        this.admissionDashVisible = true;
        break;
    }

    console.log('Navigating to Choose Module...');
    this.updateBreadcrumb('Choose Module');
  }

  updateBreadcrumb(label: string) {
    // Ensure "Software Dashboard" is always at the start
    if (this.breadcrumbs.length === 0) {
      this.breadcrumbs.push('Welcome To Document Management Software : AINU');
    }

    // Prevent duplicate entries
    if (!this.breadcrumbs.includes(label)) {
      this.breadcrumbs.push(label);
    }
  }
  // ✅ New Function: Remove Last Entry When Going Back
  removeLastBreadcrumb() {
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
  }
  resetSections() {
    this.showUserList = false;
    this.showModuleList = false;
    this.isDashVisible = false;
    this.admissionDashVisible = false;
  }

  filterDistinctModules() {
    const term = this.searchDistinctModuleTerm?.toLowerCase().trim();
    if (!term) {
      this.filteredDistinctModules = [...this.distinctModules];
    } else {
      this.filteredDistinctModules = this.distinctModules.filter((mod) =>
        mod.moduleDetails?.['MODLE NAME ']?.toLowerCase().includes(term)
      );
    }
  }

  //4th dashboard
  showAdtAdmission() {
    this.updateBreadcrumb('ADT admission reports data');
    this.isDashVisible = false;
    this.isAdtReportVisible = true;
    this.apiService.getAdtAdmissionReport().subscribe(
      (data: any) => {
        console.log('API Data:', data); // Debugging Step

        // 🔹 Map "Admitting doctor" to a new key "admittingDoctor"
        this.originalAdtAdmissionReports = data.map((report: any) => ({
          ...report,
          admittingDoctor: report['Admitting doctor']
            ? report['Admitting doctor']
            : 'N/A', // Ensures binding
        }));

        this.filteredReports = [...this.originalAdtAdmissionReports]; // Initialize filtered data
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  goBackSecondDash() {
    this.secondDashVisible = true;
    this.isDashVisible = false;
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
  }
  goBackThirdDash() {
    this.filteredReports = this.distinctModules.map((module) => ({
      REPORT_NAME: module.REPORT_NAME,
      MODLE_NAME: module.moduleName || 'Unknown Module', // ✅ Ensure module name is retained
    }));
    this.isDashVisible = true;
    this.isAdtReportVisible = false;
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
  }
  goBackfirstDash() {
    this.secondDashVisible = false;
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
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
    this.isAdtReportVisible = false;
    this.secondDashVisible = false;
    this.showUserList = true;
    this.isSidebarOpen = false;
    this.showModuleList = false;
    this.isSidebarOpen = true;
    this.isDashVisible = false;
    this.admissionDashVisible = false;
    this.admissionviewDashVisible = false;
    this.isSideModuleVisible = false;
    this.isLogVisible = false;
    this.cdRef.detectChanges(); // ✅ Forces UI update
    this.breadcrumbs = ['Master -> User'];
  }
  closeUserList() {
    this.showUserList = false;
  }

  openSideModuleList() {
    this.isSideModuleVisible = true;
    this.showUserList = false;
    this.showModuleList = false;
    this.isLogVisible = false;
    this.isAdtReportVisible = false;
    this.secondDashVisible = false;
    this.breadcrumbs = ['Master -> Module List'];
  }

  AddModule() {
    const dialogRef = this.dialog.open(AddModuleComponent, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('✅ Dialog closed with:', result);

        // ✅ Activate this code to refresh table after closing popup
        this.fetchModules();
      }
    });
  }

  fetchModules() {
    this.apiService.getModules().subscribe({
      next: (data: any) => {
        this.modules = data.filter(
          (module: { isDeleted: any }) => !module.isDeleted
        ); // ✅ Keep only active modules
        this.filteredModules = [...this.modules]; // ✅ Mirror the filtered list
        console.log('✅ Filtered Modules:', this.modules);
      },
      error: (err) => console.error('❌ Error fetching modules:', err),
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
    return 'fa-sort';
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
          this.fetchUsers();
          // this.users = data; // ✅ Assign response to the `users` array
          // this.users = [...this.users];
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
    this.isSideModuleVisible = false;
    this.isLogVisible = false;

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
    this.admissionDashVisible = false;
    this.isAdtReportVisible = false;
    this.admissionviewDashVisible = false;
    this.isSideModuleVisible = false;
    this.isLogVisible = false;
    this.breadcrumbs = ['Welcome To Document Management Software : AINU'];
  }

  filterUsers() {
    const term = this.searchTerm?.toLowerCase().trim();

    if (!term) {
      this.filteredUsers = [...this.users]; // Show all if empty search
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.UserName?.toLowerCase().includes(term) ||
          user.Email?.toLowerCase().includes(term)
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.users = [...this.filteredUsers]; // ✅ Restore full user list
  }

  filterModules() {
    const term = this.searchModuleTerm?.toLowerCase().trim();
    if (!term) {
      this.filteredModules = [...this.modules];
    } else {
      this.filteredModules = this.modules.filter(
        (module) =>
          module['MODLE NAME ']?.toLowerCase().includes(term) ||
          module['REPORT NAME']?.toLowerCase().includes(term) ||
          module.Moduleid?.toString().includes(term)
      );
    }
  }

  filteredAdtReports() {
    const term = this.searchText.toLowerCase().trim();

    if (!term) {
      this.filteredReports = [...this.originalAdtAdmissionReports]; // Reset filter
      return;
    }

    this.filteredReports = this.originalAdtAdmissionReports.filter(
      (report: any) => {
        const patientName = String(report['Patient Name'] || '')
          .trim()
          .toLowerCase();
        const match = patientName.includes(term);

        console.log(
          'Checking Patient Name:',
          `"${patientName}"`,
          '| Search Term:',
          `"${term}"`,
          '| Match:',
          match
        );

        return (
          match ||
          String(report.UHid || '')
            .toLowerCase()
            .includes(term) ||
          String(report.IPNO || '')
            .toLowerCase()
            .includes(term) ||
          String(report['Admission Date & Time'] || '')
            .toLowerCase()
            .includes(term)
        );
      }
    );
  }

  clearAdtSearch() {
    this.searchText = '';
    this.filteredReports = [...this.originalAdtAdmissionReports]; // Reset data
  }

  applySearchFilters() {
    const nameSearch = this.normalizeText(this.searchCriteria.patientName);
    const uhidSearch = this.normalizeText(this.searchCriteria.UHID);
    const ipnoSearch = this.normalizeText(this.searchCriteria.IPNO);
    const locationSearch = this.normalizeText(this.searchCriteria.location);

    this.filteredReports = this.originalAdtAdmissionReports.filter((report) => {
      const patientName = this.normalizeText(
        String(report['Patient Name'] || '')
      );
      const uhid = this.normalizeText(String(report.UHid || ''));
      const ipno = this.normalizeText(String(report.IPNO || ''));
      const location = this.normalizeText(String(report.LocationName || ''));

      const match =
        (!nameSearch || patientName.includes(nameSearch)) &&
        (!uhidSearch || uhid.includes(uhidSearch)) &&
        (!ipnoSearch || ipno.includes(ipnoSearch)) &&
        (!locationSearch || location.includes(locationSearch));

      console.log('Checking:', { patientName, uhid, ipno, location, match });
      return match;
    });
  }

  clearSearchFilters() {
    this.searchCriteria = {
      UHID: '',
      IPNO: '',
      patientName: '',
      location: '',
      admissionDate: '',
    };
    this.filteredReports = [...this.originalAdtAdmissionReports];
  }

  fetchUsers() {
    this.apiService.getUsers().subscribe((data) => {
      this.users = data; // Display filtered users
      // this.filteredUsers = [...data]; // Store original list for reset
      this.totalUsers = this.users.length; // ✅ count
      this.filteredUsers = [...data]; // Show all initially
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
  editUserList(user: any) {
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
        this.fetchUsers();
      }
    });
  }

  editModuleList(module: any) {
    const dialogRef = this.dialog.open(AddModuleComponent, {
      width: '600px',
      disableClose: false,
      data: module,
    });

    // console.log('📢 User ID Sent to Dialog:', user._id);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchModules(); // ✅ Refresh table when dialog closes with success
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

  editAdtFormData() {
    this.admissionDashVisible = true;
    this.isAdtReportVisible = false;
    this.secondDashVisible = false;
  }
  viewAdtFormData(data: any) {
    this.updateBreadcrumb('view ADT admission reports data');
    this.patient = data;
    console.log('data', this.patient);
    // Optional: Save to localStorage (if needed)
    localStorage.setItem('selectedAdtPatient', JSON.stringify(data));

    this.admissionviewDashVisible = true;
    this.isAdtReportVisible = false;
    this.isLogVisible = false;
  }
  BackToAdtReport() {
    this.isAdtReportVisible = true;
    this.admissionDashVisible = false;
  }
  BackToadtAdmissionData() {
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
    this.admissionviewDashVisible = false;
    this.isAdtReportVisible = true;
  }

  openLogList() {
    this.isLogVisible = true;
    this.showModuleList = false;
    this.showUserList = false;
    this.isSideModuleVisible = false;
    this.secondDashVisible = false;
    this.isDashVisible = false;
    this.isAdtReportVisible = false;
    this.admissionviewDashVisible = false;
    this.breadcrumbs = ['Master -> Log List'];
  }

  deleteModule(module: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: { message: 'Are you sure you want to delete this module?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteModule(module.Moduleid).subscribe(() => {
          this.showSuccessSnackbar('✅ Module deleted successfully!');
          this.fetchModules(); // Reload active users after soft deletion
        });
      }
    });
  }

  fetchLogs() {
    this.apiService.getLogs().subscribe({
      next: (data: any[] = []) => {
        this.logs = data;
        this.filteredLogs = data;
        // this.logs = [...this.logs];
        console.log('✅ Logs Fetched:', this.logs);
      },
      error: (err) => console.error('❌ Error fetching logs:', err),
    });
  }

  filterLogs() {
    const term = this.searchTerm.toLowerCase();

    this.filteredLogs = this.logs.filter(
      (log) =>
        (log.formattedTimestamp?.toLowerCase() || '').includes(term) ||
        (log.userId?.toLowerCase() || '').includes(term) ||
        (log.purpose?.toLowerCase() || '').includes(term) ||
        (log.remarks?.toLowerCase() || '').includes(term)
    );
  }
}
