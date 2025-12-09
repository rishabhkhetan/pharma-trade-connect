import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id?: number;
  email: string;
  password?: string;
  name: string;
  role: 'ADMIN' | 'RETAILER' | 'CLINIC';
  isApproved: 'YES' | 'NO';
  createdAt?: string;

  // NEW FIELD (mock now, real URL later)
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
   * Login - Query users by email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            return { success: false, message: 'Invalid email or password' };
          }

          const user = users[0];

          // Check if user is approved
          if (user.isApproved !== 'YES') {
            return { success: false, message: 'Account pending approval. Please wait for admin approval.' };
          }

          // Store token and user (remove password from stored user)
          const { password: _, ...userWithoutPassword } = user;
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

  /**
   * Signup - Create new user
   */
  signup(userData: Omit<User, 'id' | 'createdAt'>): Observable<any> {
    // Check if email already exists
    return this.http.get<User[]>(`${this.apiUrl}?email=${userData.email}`)
      .pipe(
        map(users => {
          if (users.length > 0) {
            throw new Error('Email already exists');
          }
          return users;
        }),
        catchError(() => throwError(() => new Error('Email already exists'))),
        // If no existing user, create new one
        map(() => {
          const newUser: User = {
            ...userData,
            role: 'RETAILER', // Auto-assign retailer role
            isApproved: 'NO',  // Pending approval
            createdAt: new Date().toISOString()
          };
          return this.http.post<User>(this.apiUrl, newUser).toPromise();
        }),
        // Flatten the nested observable
        map(promise => promise),
        catchError(error => {
          console.error('Signup error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout - Clear stored data
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current logged-in user
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Get all users (for admin)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Get pending users (isApproved = NO)
   */
  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?isApproved=NO`);
  }

  /**
   * Approve user
   */
  approveUser(userId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, { isApproved: 'YES' });
  }

  /**
   * Delete user (reject)
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}