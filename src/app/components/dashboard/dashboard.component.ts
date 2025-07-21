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
import { LocationPopupComponentComponent } from '../location-popup-component/location-popup-component.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
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
  selectedFile: File | null = null;
  filteredLogs: any[] = [];
  filteredSpecility: any[] = [];
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
  // filteredReports: any[] = [];
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
  noReportData: boolean = false;
  // selectedModuleNames: string[] = [];
  isLoginInfo: boolean = false;
  claims: any[] = [];
  filteredClaims: any[] = [];
  originalClaimReports: any[] = [];
  claimSearchText = '';
  isClaimVisible: boolean = false;
  noClaimData: boolean = false;
  fromDate: string = '';
  toDate: string = '';
  isSpecility: boolean = false;
  specialtyList: string[] = [];
  specialties: string[] = [];
  departments: string[] = [];
  selectedSpecialty: string = '';
  selectedDepartment: string = '';
  ipDischargeReports: any[] = [];
  packageReports: any[] = [];
  claimRaisedRecords: any[] = [];
  adtAdmissionReports: any[] = [];
  filteredIPDischargeReports: any[] = [];
  originalIPDischargeReports: any[] = [];
  originalPackageReports: any[] = [];
  filteredPackageReports: any[] = [];
  isPackageReportVisible: boolean = false; // toggle visibility
  isIPDischargeVisible: boolean = false; // toggle visibility
  ipSearchText: string = '';
  hasSearched: boolean = false;
  selectedLocation: string = '';

  ipSearch: any = {
    UHID: '',
    PatientName: '',
    Doctor: '',
  };

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

  claimSearch = {
    UHID: '',
    ClaimNo: '',
    PatientName: '',
    CompanyName: '',
  };

  locations: string[] = [
    'Banjara Hills',
    'Dilsukhnagar',
    'HITECH city',
    'Visakhapatnam',
    'Siliguri',
    'Secunderabad',
    'Chennai',
  ];

  ngOnInit(): void {
    this.apiService.getSpecility().subscribe({
      next: (res) =>
        (this.specialties = res.map((s: { specialty: any }) => s.specialty)),
      error: (err) => console.error('❌ Failed to fetch specialties', err),
    });

    this.apiService
      .getClaimReports()
      .subscribe((data) => console.log('✅ Claim data:', data));

    this.filteredLogs = this.logs; // initially show all
    this.fetchLogs();
    this.fetchUsers();
    this.fetchModules();
    this.fetchIPDischargeReports();
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

  openLocationPopup(): void {
    const dialogRef = this.dialog.open(LocationPopupComponentComponent, {
      width: '400px',
      data: { defaultLocation: this.locations }, // ✅ Pass full array, not a single value
    });

    dialogRef.afterClosed().subscribe((selectedLocation) => {
      if (selectedLocation) {
        localStorage.setItem('userLocation', selectedLocation);
        this.chosenLocation = selectedLocation;
        // this.filteredIPDischargeReport(); // Apply location change
      }
    });
  }

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
    this.noReportData = false;
    this.isClaimVisible = false;
    this.noClaimData = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
    this.isSpecility = false;
    this.isClaimVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
  showAdtAdmission(reportType: string): void {
    console.log('▶️ Report clicked:', reportType);
    this.updateBreadcrumb(`${reportType} data`);

    // Reset all view states
    this.isDashVisible = false;
    this.isAdtReportVisible = false;
    this.isClaimVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    this.isSpecility = false;
    this.noReportData = false;
    this.noClaimData = false;
    this.filteredReports = [];
    this.filteredClaims = [];
    this.filteredIPDischargeReports = [];
    this.filteredPackageReports = [];

    const normalized = reportType?.trim().toLowerCase();
    console.log('🧾 Normalized type:', normalized);

    // 🔎 ADT Admission Report
    if (
      normalized === 'adt admission report' ||
      normalized === 'admission reports'
    ) {
      this.apiService.getAdtAdmissionReport().subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.noReportData = true;
            this.isAdtReportVisible = false;
            return;
          }

          this.originalAdtAdmissionReports = data.map((report: any) => ({
            ...report,
            admittingDoctor: report['Admitting doctor'] || 'N/A',
          }));
          this.filteredReports = [...this.originalAdtAdmissionReports];
          this.isAdtReportVisible = true;
        },
        error: (err) => {
          console.error('❌ Failed to load ADT reports:', err);
          this.noReportData = true;
        },
      });
    }

    // 🆕 Claimed Raised Report
    else if (normalized.includes('claimed') || normalized.includes('claim')) {
      this.apiService.getClaimReports().subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.noClaimData = true;
            this.isClaimVisible = false;
            return;
          }

          this.claims = data;
          this.filteredClaims = [...data];
          this.isClaimVisible = true;
        },
        error: (err) => {
          console.error('❌ Failed to load claim reports:', err);
          this.noClaimData = true;
          this.isClaimVisible = false;
        },
      });
    }

    // 🆕 IP Discharge TAT Report
    else if (
      normalized.includes('ip discharge') ||
      normalized.includes('tat report')
    ) {
      this.apiService.getIPDischargeReports().subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.noReportData = true;
            this.isIPDischargeVisible = false;
            return;
          }

          this.originalIPDischargeReports = [...data];
          this.ipDischargeReports = [...data]; // ✅ for consistent logic
          this.filteredIPDischargeReports = [...data]; // ✅ for table binding

          // this.filteredIPDischargeReports = [...data];
          // ✅ bind this to table
          this.isIPDischargeVisible = true;
        },
        error: (err) => {
          console.error('❌ Failed to load IP Discharge reports:', err);
          this.noReportData = true;
          this.isIPDischargeVisible = false;
        },
      });
    }
    // 📦 Package Status Report
    else if (normalized.includes('package') && normalized.includes('status')) {
      this.apiService.getPackageStatusReports().subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.noReportData = true;
            this.isPackageReportVisible = false;
            return;
          }

          this.originalPackageReports = [...data];
          this.filteredPackageReports = [...data];
          this.isPackageReportVisible = true;
        },
        error: (err) => {
          console.error('❌ Failed to load Package Status report:', err);
          this.noReportData = true;
          this.isPackageReportVisible = false;
        },
      });
    }
    // ⚠️ Unrecognized Report Type
    else {
      console.warn('⚠️ Unknown report type:', normalized);
      this.noReportData = true;
    }
  }

  goBackSecondDash() {
    this.secondDashVisible = true;
    this.isDashVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
  }

  goBackThirdDash() {
    this.filteredReports = [...this.originalReports]; // ✅ Restore previously filtered reports
    this.isDashVisible = true;
    this.isAdtReportVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop();
    }
  }

  goBackfirstDash() {
    this.secondDashVisible = false;
    this.noReportData = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop(); // Removes the last breadcrumb step
    }
    // this.isDashVisible = true;
    // this.secondDashVisible = false;
  }

  goBackfourthDashboard() {
    this.filteredReports = [...this.originalReports]; // ✅ Restore previously filtered reports
    this.isDashVisible = true;
    this.isClaimVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop();
    }
  }

  goBackToFifthDashboard() {
    this.filteredReports = [...this.originalReports]; // ✅ Restore previously filtered reports
    this.isDashVisible = true;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    // this.isClaimVisible = false;
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop();
    }
  }

  goBackToSixthDashboard() {
    this.filteredReports = [...this.originalReports]; // ✅ Restore previously filtered reports
    this.isDashVisible = true;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    if (this.breadcrumbs.length > 1) {
      this.breadcrumbs.pop();
    }
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
    this.isClaimVisible = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
    this.isClaimVisible = false;
    this.secondDashVisible = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
    this.noReportData = false;
    this.isClaimVisible = false;
    this.noClaimData = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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

  filteredAdtReports(): void {
    const from = this.fromDate ? new Date(this.fromDate) : null;
    const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;

    this.filteredReports = this.originalAdtAdmissionReports.filter(
      (report: any) => {
        const rawDate = report['Admission Date & Time']?.trim();
        let admissionDate: Date | null = null;

        if (rawDate) {
          const [datePart, timePart] = rawDate.split(' ');
          const [day, month, year] = datePart.includes('-')
            ? datePart.split('-')
            : datePart.split('/');

          admissionDate = new Date(
            `${year}-${month}-${day}T${timePart || '00:00:00'}`
          );
        }

        const matchDate =
          (!from || (admissionDate && admissionDate >= from)) &&
          (!to || (admissionDate && admissionDate <= to));

        const specialty =
          report['Primary doctor Specialty'] ||
          report['Admitting doctor Specialty'] ||
          report['Specialty'] ||
          '';

        const matchSpecialty =
          !this.selectedSpecialty?.trim() ||
          specialty
            .trim()
            .toLowerCase()
            .includes(this.selectedSpecialty.trim().toLowerCase());

        const locationInReport = report['H Location'] || '';
        const matchLocation =
          !this.chosenLocation?.trim() ||
          locationInReport.trim().toLowerCase() ===
            this.chosenLocation.trim().toLowerCase();

        // console.log('📍 Debug Record:', {
        //   rawDate,
        //   parsedAdmissionDate: admissionDate,
        //   fromDate: from,
        //   toDate: to,
        //   specialty,
        //   selectedSpecialty: this.selectedSpecialty,
        //   location: report['H Location'],
        //   selectedLocation: this.chosenLocation,
        //   matchDate,
        //   matchSpecialty,
        //   matchLocation,
        // });
        return matchDate && matchSpecialty && matchLocation;
      }
    );

    this.hasSearched = true;
  }

  clearAdtSearch() {
    this.searchText = '';
    this.selectedSpecialty = '';
    this.fromDate = '';
    this.toDate = '';
    this.hasSearched = false;
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
    this.isClaimVisible = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
  }
  viewAdtFormData(data: any) {
    this.updateBreadcrumb('view ADT admission reports data');
    this.patient = data;
    console.log('data', this.patient);
    // Optional: Save to localStorage (if needed)
    localStorage.setItem('selectedAdtPatient', JSON.stringify(data));

    this.admissionviewDashVisible = true;
    this.isAdtReportVisible = false;
    this.isClaimVisible = false;
    this.isLogVisible = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
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
    this.isClaimVisible = false;
    this.isSpecility = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    this.admissionviewDashVisible = false;
    this.breadcrumbs = ['Master -> Log List'];
  }

  openSpecilityList() {
    this.isSpecility = true;
    this.isLogVisible = false;
    this.showModuleList = false;
    this.showUserList = false;
    this.isSideModuleVisible = false;
    this.secondDashVisible = false;
    this.isDashVisible = false;
    this.isAdtReportVisible = false;
    this.isClaimVisible = false;
    this.admissionviewDashVisible = false;
    this.isIPDischargeVisible = false;
    this.isPackageReportVisible = false; // Reset package report visibility
    this.breadcrumbs = ['Master -> Specility List'];
    this.apiService.getSpecility().subscribe({
      next: (res) => {
        this.filteredSpecility = res;
      },
      error: (err) => {
        console.error('❌ Failed to load specialties:', err);
      },
    });
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

  trackByIndex(index: number): number {
    return index;
  }

  applyClaimFilters() {
    this.filteredClaims = this.claims.filter(
      (c) =>
        (!this.claimSearch.UHID || c.UHID?.includes(this.claimSearch.UHID)) &&
        (!this.claimSearch.ClaimNo ||
          c.ClaimNo?.includes(this.claimSearch.ClaimNo)) &&
        (!this.claimSearch.PatientName ||
          c['Patient Name']
            ?.toLowerCase()
            .includes(this.claimSearch.PatientName.toLowerCase())) &&
        (!this.claimSearch.CompanyName ||
          c['Company Name']
            ?.toLowerCase()
            .includes(this.claimSearch.CompanyName.toLowerCase()))
    );
  }

  clearClaimFilters() {
    this.claimSearch = {
      UHID: '',
      ClaimNo: '',
      PatientName: '',
      CompanyName: '',
    };
    this.filteredClaims = [...this.claims];
  }

  filterClaimResults() {
    const text = this.claimSearchText.toLowerCase();
    this.filteredClaims = this.claims.filter(
      (c) =>
        c.UHID?.toLowerCase().includes(text) ||
        c.ClaimNo?.toLowerCase().includes(text) ||
        c['Patient Name']?.toLowerCase().includes(text) ||
        c['Company Name']?.toLowerCase().includes(text)
    );
  }

  filteredIPDischargeReport(): void {
    const from = this.fromDate ? new Date(this.fromDate) : null;
    const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;

    this.filteredIPDischargeReports = this.ipDischargeReports.filter(
      (report: any) => {
        const rawDate =
          report['Discharge Date & Time']?.trim() ||
          report['Discharge Date & Time ']?.trim();

        let dischargeDate: Date | null = null;

        if (rawDate) {
          const [datePart, timePart] = rawDate.split(' ');
          const [day, month, year] = datePart.split('-');
          dischargeDate = new Date(
            `${year}-${month}-${day}T${timePart || '00:00:00'}`
          );
        }

        const matchDate =
          (!from || (dischargeDate && dischargeDate >= from)) &&
          (!to || (dischargeDate && dischargeDate <= to));

        const specialty =
          report['Primary doctor Specialty'] ||
          report['Admitting doctor Specialty'] ||
          report['Specialty'] ||
          '';

        const matchSpecialty =
          !this.selectedSpecialty?.trim() ||
          specialty
            .trim()
            .toLowerCase()
            .includes(this.selectedSpecialty.trim().toLowerCase());

        const locationInReport = report['H Location'] || '';
        const matchLocation =
          !this.chosenLocation?.trim() ||
          locationInReport.trim().toLowerCase() ===
            this.chosenLocation.trim().toLowerCase();

        return matchDate && matchSpecialty && matchLocation;
      }
    );

    this.hasSearched = true;
  }

  clearFilters(): void {
    this.selectedSpecialty = '';
    this.fromDate = '';
    this.toDate = '';
    this.hasSearched = false;
    this.filteredIPDischargeReports = [...this.ipDischargeReports];
  }

  viewIPDischargeReportFormData() {}
  downloadAsCSV(): void {
    const rows = this.filteredIPDischargeReports;
    if (!rows.length) return;

    const replacer = (key: string, value: any) => value ?? '';
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(','), // header row first
      ...rows.map((row) =>
        header.map((field) => JSON.stringify(row[field], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Discharge_Report.csv');
    link.click();
  }

  downloadAsExcel(): void {
    const fileName = 'Discharge_Report.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(this.filteredIPDischargeReports);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, fileName);
  }

  downloadADTAsExcel() {
    const fileName = 'Package_status_report.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(this.filteredReports);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, fileName);
  }

  downloadPackageStatusCSV() {
    const rows = this.filteredReports;
    if (!rows.length) return;

    const replacer = (key: string, value: any) => value ?? '';
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(','), // header row first
      ...rows.map((row) =>
        header.map((field) => JSON.stringify(row[field], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Package_status_report.csv');
    link.click();
  }

  downloadPackageStatusAsExcel() {
    const fileName = 'ADT_Report.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(this.filteredReports);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, fileName);
  }

  downloadADTAsCSV() {
    const rows = this.filteredReports;
    if (!rows.length) return;

    const replacer = (key: string, value: any) => value ?? '';
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(','), // header row first
      ...rows.map((row) =>
        header.map((field) => JSON.stringify(row[field], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ADT_Report.csv');
    link.click();
  }

  selectAll: boolean = false;

  toggleSelectAll() {
    this.filteredIPDischargeReports.forEach(
      (report) => (report.isSelected = this.selectAll)
    );
    this.filteredReports.forEach(
      (AdtAdmissionReport) => (AdtAdmissionReport.isSelected = this.selectAll)
    );

    this.filteredPackageReports.forEach(
      (pkg) => (pkg.isSelected = this.selectAll)
    );

    this.filteredClaims.forEach(
      (claims) => (claims.isSelected = this.selectAll)
    );
  }

  deleteSelectedIPDischargeReports() {
    const selectedReports = this.filteredIPDischargeReports.filter(
      (r) => r.isSelected
    );
    if (selectedReports.length === 0) return;

    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: {
        message: 'Are you sure you want to delete selected discharge records?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const selectedIds = selectedReports.map((report) => report._id);

        this.apiService.softDeleteIPReports(selectedIds).subscribe(() => {
          this.showSuccessSnackbar('✅ Records marked as deleted!');
          this.selectAll = false;

          this.fetchIPDischargeReports();
        });
      }
    });
  }

  deleteSelectedPkgStatusReports() {
    const selectedReports = this.filteredPackageReports.filter(
      (pkg) => pkg.isSelected
    );
    if (selectedReports.length === 0) return;

    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: {
        message:
          'Are you sure you want to delete selected package status records?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const selectedIds = selectedReports.map((pkg) => pkg._id);

        this.apiService
          .softDeletePackageStatusReport(selectedIds)
          .subscribe(() => {
            this.showSuccessSnackbar('✅ Package records marked as deleted!');
            this.selectAll = false;

            this.fetchPackageStatusReport(); // 🔄 Refresh the list
          });
      }
    });
  }
  fetchIPDischargeReports() {
    this.apiService.getIPDischargeReports().subscribe({
      next: (data: any) => {
        this.ipDischargeReports = data.filter(
          (report: { isDeleted: boolean }) => !report.isDeleted
        ); // ✅ Remove deleted records
        this.filteredIPDischargeReports = [...this.ipDischargeReports]; // ✅ Mirror for display
        console.log(
          '✅ Active Discharge Reports:',
          this.filteredIPDischargeReports
        );
      },
      error: (err) => {
        console.error('❌ Error fetching IP discharge reports:', err);
      },
    });
  }

  fetchAdtAdmissionReports() {
    this.apiService.getAdtAdmissionReport().subscribe({
      next: (data: any) => {
        this.adtAdmissionReports = data.filter(
          (report: { isDeleted: boolean }) => !report.isDeleted
        ); // ✅ Remove soft-deleted entries
        this.filteredReports = [...this.adtAdmissionReports]; // ✅ Mirror for display
        console.log('✅ Active ADT Admission Reports:', this.filteredReports);
      },
      error: (err) => {
        console.error('❌ Error fetching ADT admission reports:', err);
      },
    });
  }

  fetchPackageStatusReport(): void {
    this.apiService.getPackageStatusReports().subscribe({
      next: (data: any) => {
        this.packageReports = data.filter(
          (report: { isDeleted: boolean }) => !report.isDeleted
        ); // ✅ Remove deleted records
        this.filteredPackageReports = [...this.packageReports]; // ✅ Mirror for display

        console.log(
          '✅ Active Package Status Reports:',
          this.filteredPackageReports
        );
      },
      error: (err) => {
        console.error('❌ Error fetching Package Status Reports:', err);
      },
    });
  }

  deleteSelectedAdtAdmissionReports() {
    const selectedReports = this.filteredReports.filter((r) => r.isSelected);
    if (selectedReports.length === 0) return;

    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: {
        message:
          'Are you sure you want to delete selected ADT admission records?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const selectedIds = selectedReports.map((report) => report._id);

        this.apiService.softDeleteAdtAdmissions(selectedIds).subscribe(() => {
          this.showSuccessSnackbar('✅ ADT records marked as deleted!');
          this.selectAll = false;

          this.fetchAdtAdmissionReports(); // Refresh table
        });
      }
    });
  }

  selectedIPFile: File | null = null;

  onIPFileSelected(event: any): void {
    const file = event.target?.files?.[0] || null;
    if (file) {
      this.selectedIPFile = file;
      console.log('📥 Selected:', file.name);
    }
  }

  uploadIPFile(): void {
    if (!this.selectedIPFile) return;

    this.apiService.uploadFile(this.selectedIPFile).subscribe({
      next: () => {
        this.showSuccessSnackbar(`✅  uploaded successfully!`);
        this.selectedIPFile = null;
        this.fetchIPDischargeReports(); // refresh table data
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        this.showErrorSnackbar('Upload failed. Try again.');
      },
    });
  }
  showErrorSnackbar(arg0: string) {
    throw new Error('Method not implemented.');
  }

  fetchClaimRaisedData() {
    this.apiService.getClaimReports().subscribe({
      next: (data: any) => {
        this.claimRaisedRecords = data.filter(
          (claim: { isDeleted: boolean }) => !claim.isDeleted
        ); // ✅ Filter out soft-deleted claims
        this.filteredClaims = [...this.claimRaisedRecords]; // ✅ Sync for UI display
        console.log('✅ Active Claim Raised Records:', this.filteredClaims);
      },
      error: (err) => {
        console.error('❌ Error fetching claim raised records:', err);
      },
    });
  }

  deleteSelectedClaimReports() {
    const selectedClaims = this.filteredClaims.filter((c) => c.isSelected);
    if (selectedClaims.length === 0) return;

    const dialogRef = this.dialog.open(DeleteConfirmationPopupComponent, {
      data: {
        message: 'Are you sure you want to delete selected claim records?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const selectedIds = selectedClaims.map((claim) => claim._id);

        this.apiService.softDeleteClaimReport(selectedIds).subscribe(() => {
          this.showSuccessSnackbar('✅ Claim records marked as deleted!');
          this.selectAll = false;

          this.fetchClaimRaisedData(); // Refresh table
        });
      }
    });
  }
  downloadClaimAsCSV() {
    const rows = this.filteredClaims;
    if (!rows.length) return;

    const replacer = (key: string, value: any) => value ?? '';
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(','),
      ...rows.map((row) =>
        header.map((field) => JSON.stringify(row[field], replacer)).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'claim_status_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadClaimAsExcel() {
    const fileName = 'claim_status_report.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(this.filteredReports);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(data, fileName);
  }
}
