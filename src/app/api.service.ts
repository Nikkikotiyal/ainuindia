import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { log } from 'node:console';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  // private baseUrl = 'http://69.62.80.20:3000/api';

  constructor(private http: HttpClient) {}
  login(emailOrUsername: string, password: string) {
    console.log('🔄 Sending login request...'); // Debugging log

    return this.http
      .post(
        `${this.baseUrl}/login`,
        { emailOrUsername, password }, // ✅ Correct key names
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        tap((response) => {
          console.log('✅ Request sent successfully');
          localStorage.setItem('user', JSON.stringify(response));
        }),

        catchError((error) => {
          console.error('❌ Login request failed:', error);
          return throwError(() => new Error('Login failed'));
        })
      );
  }
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-users`);
  }

  getUsersByLocation(location: string) {
    return this.http.get(
      `${this.baseUrl}/getUsers/${encodeURIComponent(location)}`
    );
  }

  signupUsers(
    UserName: string,
    Password: string,
    Designation: string,
    Email: string,
    Role: string,
    MobileNo: string,
    Status: string,
    Location: string
  ) {
    return this.http.post(
      `${this.baseUrl}/signup`,
      {
        username: UserName, // ✅ lowercase key
        password: Password,
        designation: Designation,
        email: Email,
        role: Role,
        mobileNo: MobileNo, // ✅ lowercase key
        status: Status,
        location: Location,
      },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      }
    );
  }

  getModules() {
    return this.http.get<any[]>(`${this.baseUrl}/getModule`); // or /getModule
  }

  // getCheckedModules(){
  //   return this.http.get<any[]>(`${this.baseUrl}/getCheckedModule`); // or /getModule

  // }

  saveModules(payload: { userId: string; modules: any[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/save-modules`, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  getUserModulesByUserID(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getUserModules/${userId}`);
  }

  // ✅ File: api.service.ts

  getUserById(userId: string): Observable<any> {
    console.log('📢 API Call Triggered for userId:', userId);
    return this.http.get(`${this.baseUrl}/getUserById/${userId}`);
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateUserById/${userId}`, data);
  }

  changePassword(payload: any) {
    console.log("localStorage.getItem('token')",localStorage.getItem('userToken'));

    return this.http.post(`${this.baseUrl}/changePassword`, payload, {
       headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } // ✅ Send user token  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

    deleteUser(userId: string) {
    return this.http.put(`${this.baseUrl}/deleteUser/${userId}`, {});
  }
}
