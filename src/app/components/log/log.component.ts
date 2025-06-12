import { Component, NgModule, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss',
})
export class LogComponent implements OnInit {
  logForm!: FormGroup; // ✅ Main Reactive Form
   logs: any[] = []; // ✅ Logs array (No FormGroup)

  constructor(private fb: FormBuilder, private ApiService: ApiService,private router: Router,) {}


  ngOnInit() {
    this.loadLogs(); // ✅ Fetch logs from API
  }

  loadLogs() {
    this.ApiService.getLogs().subscribe((data: any[]) => {
    console.log("🔍 Logs Data:", data); // ✅ Debugging
    console.log("🔍 First Log Entry:", this.logs[24]);
    this.logs = data; // ✅ Bind logs directly to logs array
  });
  }
  BackToDash(){
    this.router.navigate(['/dashboard']);
  }
}
