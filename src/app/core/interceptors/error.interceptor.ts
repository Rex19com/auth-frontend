import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // A 401 from the login endpoint just means "wrong credentials"
      const isLoginCall = req.url.includes('/auth/login');
      if (error.status === 401 && !isLoginCall) {
        authService.logout(); // clears state and redirects to login
      }
      if (error.status === 403) {
        console.error('Access denied:', error.error?.error?.message);
      }
      return throwError(() => error);
    })
  );
};