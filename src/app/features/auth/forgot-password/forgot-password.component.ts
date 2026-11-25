import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  successMessage = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = this.authService.isLoading;
  error = this.authService.error;

  ngOnInit(): void {
    this.authService.clearError();
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const { email } = this.forgotForm.value;

    this.authService.forgotPassword(email!).subscribe({
      next: (response) => this.successMessage.set(response.message),
      error: (err) => console.error('Forgot password failed:', err),
    });
  }

  get f() {
    return this.forgotForm.controls;
  }
}