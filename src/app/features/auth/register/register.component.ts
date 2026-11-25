import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  successMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/),
    ]],
    confirmPassword: ['', Validators.required],
    age: this.fb.control<number | null>(null, [Validators.min(13), Validators.max(120)]),
  });

  isLoading = this.authService.isLoading;
  error = this.authService.error;

  ngOnInit(): void {
    this.authService.clearError();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password, confirmPassword, age } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.authService.setError('Passwords do not match');
      return;
    }

    this.authService
      .register({ name: name!, email: email!, password: password!, age: age ?? undefined })
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.registerForm.reset();
        },
        error: (err) => console.error('Registration failed:', err),
      });
  }

  get f() {
    return this.registerForm.controls;
  }
}