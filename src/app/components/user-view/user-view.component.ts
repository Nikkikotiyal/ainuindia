// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ApiService } from '../../api.service';
// import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { AddUserComponent } from '../add-user/add-user.component';
// import { UserModuleComponent } from '../user-module/user-module.component';

// @Component({
//   selector: 'app-user-view',
//   standalone: true,
//   imports: [CommonModule,MatDialogModule],
//   templateUrl: './user-view.component.html',
//   providers: [{ provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }]
// })
// export class UserViewComponent implements OnInit {
//   modules: any[] = [];
//   users: any[] = []; // ✅ Declare the 'users' property
//   selectedRecord: any = null;
//   selectedUser: any = null;
//   paginatedModules: any[] = [];
//   currentPage = 1;
//   itemsPerPage = 10;
//   totalPages = 1;

//   // private activeDialog: any;

//   constructor(
//     private dialog: MatDialog,
//     private apiService: ApiService,
//   ) {}

//   ngOnInit() {
//     this.updatePagination();
//     // ✅ Fetch users when the component initializes
//     this.apiService.getUsers().subscribe(
//       (data: any) => {
//         this.users = data; // ✅ Assign response to the 'users' array
//         console.log(this.users); // ✅ Log the users
//       },
//       (error) => {
//         console.error('Error fetching users:', error);
//       }
//     );
//   }

//   openModule(user: any) {
//     // this.dialogRef.close();
//     this.dialog.open(UserModuleComponent, {
//       width: '100%',
//       disableClose: true,
//       data: { record: user }  // 🔸 Important
//     });
//   }

//   openAddUserDialog() {
//     // ✅ Directly open the AddUserComponent without closing dialogRef
//     this.dialog.open(AddUserComponent, {
//       width: '600px',
//       disableClose: true,
//     });
//   }

//   updatePagination() {
//     this.totalPages = Math.ceil(this.modules.length / this.itemsPerPage);
//     const start = (this.currentPage - 1) * this.itemsPerPage;
//     const end = start + this.itemsPerPage;
//     this.paginatedModules = this.modules.slice(start, end);
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       this.updatePagination();
//     }
//   }

//   prevPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.updatePagination();
//     }
//   }

//   toggleAll(event: any) {
//     const checked = event.target.checked;
//     this.paginatedModules.forEach(mod => mod.selected = checked);
//   }

// }
