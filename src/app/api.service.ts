import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { log } from 'node:console';

export interface UserModule {
  ModuleId: number;
  MODLE_NAME: string;
  REPORT_NAME: string;
  Selected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  // private baseUrl = 'https://dmsapi.softmaart.co.in:3000/api';

  constructor(private http: HttpClient) {}
  login(
    emailOrUsername: string,
    password: string
  ): Observable<{ user: any; token: string }> {
    console.log('🔄 Sending login request...');

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('user-email', emailOrUsername); // ✅ Attach user email during login request

    return this.http
      .post<{ user: any; token: string }>(
        `${this.baseUrl}/login`,
        { emailOrUsername, password },
        { headers }
      ) // ✅ Pass headers correctly
      .pipe(
        tap((response) => {
          console.log('✅ Login request successful');

          if (response.user.isDeleted) {
            console.error('❌ Account deactivated: Blocking login');
            throw new Error('Your account has been deactivated.');
          }

          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
        }),
        catchError((error) => {
          console.error('❌ Login request failed:', error);
          return throwError(
            () => new Error(error.error?.message || 'Login failed')
          );
        })
      );
  }

  getUsers(): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';

    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.baseUrl}/get-users`, { headers });
  }

  getUsersByLocation(location: string): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';

    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(
      `${this.baseUrl}/getUsers/${encodeURIComponent(location)}`,
      { headers }
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

  getModules(): Observable<any[]> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';

    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });

    return this.http.get<any[]>(`${this.baseUrl}/getModule`, { headers });
  }

  // getCheckedModules(){
  //   return this.http.get<any[]>(`${this.baseUrl}/getCheckedModule`); // or /getModule

  // }

  saveModules(payload: { userId: string; modules: any[] }): Observable<any> {
    console.log('🔄 Sending payload:', JSON.stringify(payload, null, 2)); // ✅ Debugging step

    if (!payload.userId || !Array.isArray(payload.modules)) {
      console.error('❌ Invalid payload:', payload);
      return throwError(() => new Error('Invalid payload structure!'));
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });

    return this.http.post(`${this.baseUrl}/save-modules`, payload, { headers });
  }

  getUserModulesByUserID(userId: string): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });

    return this.http.get<any>(
      `${this.baseUrl}/getUserModulesByUserID/${userId}`,
      { headers }
    ); // ✅ Pass headers correctly
  }

  getDashUserModulesByUserID(
    userId: string
  ): Observable<{ modules: UserModule[] }> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });

    return this.http.get<{ modules: UserModule[] }>(
      `${this.baseUrl}/getDashUserModuleByUserId/${userId}`,
      { headers }
    ); // ✅ Pass headers correctly
  }

  // ✅ File: api.service.ts

  getUserById(userId: string): Observable<any> {
    console.log('📢 API Call Triggered for userId:', userId);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.get(`${this.baseUrl}/getUserById/${userId}`, { headers }); // ✅ Pass headers correctly
  }

  updateUser(userId: string, data: any): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.put(`${this.baseUrl}/updateUserById/${userId}`, data, {
      headers,
    }); // ✅ Pass headers correctly
  }

  changePassword(payload: any): Observable<any> {
    console.log(
      "localStorage.getItem('token')",
      localStorage.getItem('userToken')
    );

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json') // ✅ Maintain existing headers
      .set('Authorization', `Bearer ${localStorage.getItem('userToken')}`) // ✅ Send user token
      .set('user-email', userEmail); // ✅ Attach user email

    return this.http.post(`${this.baseUrl}/changePassword`, payload, {
      headers,
    });
  }

  deleteUser(userId: string): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.put(
      `${this.baseUrl}/deleteUser/${userId}`,
      {},
      { headers }
    ); // ✅ Pass headers correctly
  }

  sendOtp(email: string): Observable<{ message: string }> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const headers = new HttpHeaders().set('user-email', userEmail); // ✅ Attach user email

    return this.http.post<{ message: string }>(
      `${this.baseUrl}/sendOtp`,
      { Email: email },
      { headers }
    ); // ✅ Pass headers correctly
  }

  verifyOtp(email: string, otp: string): Observable<{ token: string }> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const headers = new HttpHeaders().set('user-email', userEmail); // ✅ Attach user email

    return this.http.post<{ token: string }>(
      `${this.baseUrl}/verifyOtp`,
      { Email: email, otp },
      { headers }
    ); // ✅ Pass headers correctly
  }

  resendOtp(email: string): Observable<{ message: string }> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const headers = new HttpHeaders().set('user-email', userEmail); // ✅ Attach user email

    return this.http.post<{ message: string }>(
      `${this.baseUrl}/resendOtp`,
      { Email: email },
      { headers }
    ); // ✅ Pass headers correctly
  }

  getAdtAdmissionReport(): Observable<any[]> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.get<any[]>(`${this.baseUrl}/AdtAdmissionReport`, {
      headers,
    }); // ✅ Pass headers correctly
  }

  // Fetch all logs
  getLogs(): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';

    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.baseUrl}/logs`, { headers });
  }

  addModule(moduleData: any): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.post(`${this.baseUrl}/addModule`, moduleData, { headers }); // ✅ Pass headers correctly
  }

  updateModule(data: any): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.put(`${this.baseUrl}/updateModule`, data, { headers }); // ✅ Pass headers correctly
  }

  deleteModule(moduleId: string): Observable<any> {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.Email || '';
    const token = localStorage.getItem('userToken') || '';
    const headers = new HttpHeaders({
      'user-email': userEmail,
      Authorization: `Bearer ${token}`, // ✅ Attach secure token
    });
    return this.http.delete(`${this.baseUrl}/deleteModule/${moduleId}`, {
      headers,
    }); // ✅ Pass headers correctly
  }
}
