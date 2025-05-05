import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

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
        tap((loggedInUser) => {
          console.log('✅ Request sent successfully');
          // Store user data in localStorage after successful login
          localStorage.setItem('user', JSON.stringify(loggedInUser));
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
}
