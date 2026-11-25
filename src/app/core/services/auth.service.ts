import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; age?: number; }
export interface AuthResponse { token: string; user: User; }
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.tokenSignal() && !!this.currentUserSignal());
  currentUser = this.currentUserSignal.asReadonly();
  currentToken = this.tokenSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap({
          next: (res) => {
            if (res.success && res.data) this.handleLoginSuccess(res.data);
            this.loadingSignal.set(false);
          },
          error: (err) => {
            this.loadingSignal.set(false);
            this.errorSignal.set(err.error?.error?.message || 'Login failed');
          },
        }),
        map((res) => res.data!)
      );
  }

  register(data: RegisterRequest): Observable<{ message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<ApiResponse<{ message: string; userId: number }>>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap({
          next: () => this.loadingSignal.set(false),
          error: (err) => {
            this.loadingSignal.set(false);
            this.errorSignal.set(err.error?.error?.message || 'Registration failed');
          },
        }),
        map((res) => ({
          message: res.data?.message || res.message || 'Registration successful',
        }))
      );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http
      .get<ApiResponse<null>>(`${this.apiUrl}/auth/verify-email`, { params: { token } })
      .pipe(map((res) => ({ message: res.message || 'Email verified successfully' })));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        tap({
          next: () => this.loadingSignal.set(false),
          error: (err) => {
            this.loadingSignal.set(false);
            this.errorSignal.set(err.error?.error?.message || 'Request failed');
          },
        }),
        map((res) => ({ message: res.message || 'Reset link sent' }))
      );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    this.loadingSignal.set(true);
    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl}/auth/reset-password`, { token, newPassword })
      .pipe(
        tap({
          next: () => this.loadingSignal.set(false),
          error: () => this.loadingSignal.set(false),
        }),
        map((res) => ({ message: res.message || 'Password reset successful' }))
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/auth/me`)
      .pipe(map((res) => res.data!));
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.router.navigate(['/auth/login']);
  }

  setError(message: string | null): void { this.errorSignal.set(message); }
  clearError(): void { this.errorSignal.set(null); }

  private handleLoginSuccess(auth: AuthResponse): void {
    this.tokenSignal.set(auth.token);
    this.currentUserSignal.set(auth.user);
    localStorage.setItem('auth_token', auth.token);
    localStorage.setItem('current_user', JSON.stringify(auth.user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('current_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}