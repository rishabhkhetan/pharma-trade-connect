import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface User {
  id?: string | number;
  email: string;
  password?: string;
  name: string;
  role: 'ADMIN' | 'RETAILER' | 'CLINIC';
  isApproved: 'YES' | 'NO';
  createdAt?: string;

  hasLicense?: boolean;
  licenseUrl?: string | null;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private readonly TOKEN_KEY = 'pt_token';
  private readonly USER_KEY = 'pt_user';

  constructor(private http: HttpClient) {}

    /**
   * Login - Query users by email then verify password client-side (json-server)
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`)
      .pipe(
        map(users => {
          if (!users || users.length === 0) {
            return { success: false, message: 'Invalid email or password' };
          }

          const user = users[0];

          // Verify password client-side (mock only). In real backend, password check happens server-side.
          if (user.password !== password) {
            return { success: false, message: 'Invalid email or password' };
          }

          // Allow admins immediate access; other roles must be approved
          if (user.role !== 'ADMIN' && user.isApproved !== 'YES') {
            return { success: false, message: 'Account pending approval. Please wait for admin approval.' };
          }

          // Remove password before storing user
          const { password: _, ...userWithoutPassword } = user as any;

          localStorage.setItem(this.TOKEN_KEY, `token_${user.id}_${Date.now()}`);
          localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));

          return { success: true, user: userWithoutPassword };
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of({ success: false, message: 'Login failed. Please try again.' });
        })
      );
  }

  signup(payload: any) {
    const params = new HttpParams().set('email', payload.email);
    return this.http.get<User[]>(this.apiUrl, { params }).pipe(
      switchMap(users => {
        if (users && users.length > 0) {
          return throwError(() => ({ status: 409, message: 'Email already exists' }));
        }
        const body = {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          isApproved: payload.isApproved ?? 'NO',
          hasLicense: !!payload.hasLicense,
          licenseUrl: payload.licenseUrl ?? null,
          createdAt: new Date().toISOString()
        };
        return this.http.post<User>(this.apiUrl, body);
      }),
      catchError(err => throwError(() => (err?.error ?? err?.message ?? 'Signup failed')))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?isApproved=NO`);
  }

  // NOTE: accept string | number for ids returned by json-server
  approveUser(userId: string | number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, { isApproved: 'YES' });
  }

  deleteUser(userId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}