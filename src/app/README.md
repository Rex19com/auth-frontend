# Auth Frontend (Angular)

A modern Angular single-page application that provides a complete authentication experience: registration, email verification, login, forgot password, reset password, and a protected dashboard. It connects to my Node.js + Express + MySQL backend ([professional-boilerplate](https://github.com/Rex19com/professional-boilerplate)).

Built for **Hands-On Lab 12: Build Angular Auth Frontend** (Integrative Programming).

## Features

- Standalone components (no NgModules)
- Signals-based state management in `AuthService` (`signal`, `computed`)
- Built-in control flow (`@if`, `@switch`) in all templates
- Reactive Forms with validation and error messages
- Registration with password confirmation
- Email verification via a tokenized link
- Forgot password and reset password flow
- JWT login with the token persisted in `localStorage`
- HTTP interceptors:
  - `authInterceptor` attaches the `Authorization: Bearer <token>` header
  - `errorInterceptor` handles 401 (auto-logout) and 403 responses
- Route guards:
  - `authGuard` protects `/dashboard`
  - `guestGuard` keeps logged-in users away from the auth pages
- Lazy-loaded routes with `loadComponent`
- Return-URL redirect after login
- Responsive, consistent styling

## Tech Stack

- Angular (generated with Angular CLI 22.3.0)
- TypeScript
- RxJS
- Plain CSS
- Backend: Node.js, Express, TypeORM, MySQL, Nodemailer (Ethereal for test emails)

## Project Structure

```
src/
├── environments/
│   ├── environment.ts              # production settings
│   └── environment.development.ts  # development settings (used by ng serve)
└── app/
    ├── core/
    │   ├── services/auth.service.ts
    │   ├── interceptors/
    │   │   ├── auth.interceptor.ts
    │   │   └── error.interceptor.ts
    │   └── guards/
    │       ├── auth.guard.ts
    │       └── guest.guard.ts
    ├── features/
    │   ├── auth/
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── verify-email/
    │   │   ├── forgot-password/
    │   │   └── reset-password/
    │   └── dashboard/
    ├── app.config.ts
    ├── app.routes.ts
    └── app.ts
```

## Routes

| Route | Component | Guard |
|---|---|---|
| `/auth/login` | LoginComponent | guestGuard |
| `/auth/register` | RegisterComponent | guestGuard |
| `/auth/forgot-password` | ForgotPasswordComponent | guestGuard |
| `/auth/reset-password?token=...` | ResetPasswordComponent | guestGuard |
| `/verify-email?token=...` | VerifyEmailComponent | none |
| `/dashboard` | DashboardComponent | authGuard |

## Setup Instructions

### Prerequisites

- Node.js (v20 or later) and npm
- Angular CLI: `npm install -g @angular/cli`
- The backend (`professional-boilerplate`) with MySQL running

### 1. Start the backend

```bash
cd professional-boilerplate
npm install
npm run dev
```

The API runs on `http://localhost:3000`. In the backend `.env`, set:

```
FRONTEND_URL=http://localhost:4200
```

The backend must allow CORS from `http://localhost:4200` and build email links as:

- Verification: `http://localhost:4200/verify-email?token=...`
- Password reset: `http://localhost:4200/auth/reset-password?token=...`

### 2. Start the frontend

```bash
git clone https://github.com/Rex19com/auth-frontend.git
cd auth-frontend
npm install
ng serve
```

Open `http://localhost:4200`.

> Both servers must be running at the same time, otherwise the forms show "Registration failed" or "Login failed".

### 3. Try the full flow

1. Register at `/auth/register`.
2. Open the Ethereal preview URL printed in the backend terminal and click **Verify Email Address**.
3. Log in at `/auth/login` and land on the dashboard.
4. Log out, use **Forgot password?**, open the new Ethereal URL, and reset the password.
5. Log out and open `/dashboard` directly; you are redirected to the login page.

## Environment Configuration

`src/environments/environment.development.ts` (used by `ng serve`):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  frontendUrl: 'http://localhost:4200',
};
```

`src/environments/environment.ts` is used for production builds; replace the placeholder URLs when deploying.

## Screenshots

> Replace each placeholder below with your own screenshot. Save the images in a `screenshots/` folder.

| Page | Screenshot |
|---|---|
| Register (success message) | ![Register](screenshots/register.png) |
| Email verification | ![Verify Email](screenshots/verify-email.png) |
| Login | ![Login](screenshots/login.png) |
| Dashboard | ![Dashboard](screenshots/dashboard.png) |
| Forgot password | ![Forgot Password](screenshots/forgot-password.png) |
| Reset password | ![Reset Password](screenshots/reset-password.png) |

## Reflection Answers

### 1. What are the three main modern Angular features you used in this project? How do they improve the developer experience?

I used **standalone components**, **Signals**, and the **built-in control flow** (`@if`, `@switch`).

- Standalone components remove NgModules, so each component lists its own imports and the structure is easier to understand.
- Signals give simple, fine-grained reactive state. I read a value by calling it (`isLoading()`), and templates update automatically without manual subscriptions.
- Built-in control flow is more readable than `*ngIf` and `*ngSwitch`, needs no `CommonModule` import, and has better type checking.

### 2. Explain the difference between Signals and RxJS. When would you use each?

Signals hold a **current value** and notify dependents when it changes. They are synchronous and ideal for UI state such as the logged-in user, loading flags, and error messages. RxJS Observables model **streams of values over time** and are best for asynchronous work such as HTTP requests, debouncing, and combining events. In this project, HTTP calls return Observables and the results are stored in Signals for the UI.

### 3. Why is it important to have both an auth interceptor and an error interceptor?

They solve different problems. The auth interceptor attaches the JWT to every outgoing request, so components never handle tokens. The error interceptor handles failures centrally: on a 401 from a protected request it logs the user out and redirects to login, and it logs 403 errors. Having both avoids repeating this code in every service and keeps behavior consistent.

### 4. How do route guards improve security and user experience?

Guards stop unauthenticated users from reaching protected pages like `/dashboard`, and they redirect them to login with a `returnUrl` so they come back after signing in. The guest guard keeps logged-in users away from the login and register pages. Guards improve the user experience, but they are not real security on their own: the backend must still verify the JWT on every protected API request.

### 5. What is lazy loading and why is it important for performance?

Lazy loading means a component's code is downloaded only when its route is visited (`loadComponent: () => import(...)`). The initial bundle stays small, so the app loads faster. In the build output, each page (login, register, dashboard, and so on) is its own separate chunk.

### 6. Explain the "single source of truth" principle in the context of your AuthService.

All authentication state (current user, token, loading, error) lives in one place, `AuthService`, as private signals. Components and interceptors read it through read-only signals and cannot change it directly, only through methods like `login()` and `logout()`. This prevents components from having conflicting copies of the same data.

### 7. What challenges did you face when connecting the Angular frontend to the Node.js backend? How did you solve them?

- **"ng is not recognized":** Angular CLI was not installed. I installed it with `npm install -g @angular/cli` and opened a new terminal.
- **Red errors in `app.routes.ts`:** the routes pointed to components that did not exist yet. They disappeared as I created each component and rebuilt.
- **Template not found (`app.html`):** after deleting the old template, `app.ts` still referenced it. I replaced `app.ts` with an inline `<router-outlet />` template.
- **ECONNREFUSED on the backend:** MySQL was not running. I started it and restarted the backend.
- **"Registration failed" in the form:** the backend was not running at the time. Starting `npm run dev` and `ng serve` together fixed it.
- **Wrong reset link:** the backend email used `/reset-password`, but the Angular route is `/auth/reset-password`. I corrected the link in `emailService.ts`.
- **CORS:** I restricted the backend CORS origin to `http://localhost:4200`.

### 8. If you had to add a new feature (e.g., user profile editing), how would you approach it using the patterns you learned?

I would create a `features/profile` folder with a standalone component, a Reactive Form, and a lazy-loaded route protected by `authGuard`. API calls would go through a method in `AuthService` (or a new `ProfileService`) that updates the user signal on success. The existing auth interceptor would attach the token automatically, and the error interceptor would handle 401 errors.

### 9. What security considerations did you implement in the frontend (token storage, XSS prevention, etc.)?

- The JWT is stored in `localStorage` for persistence across refreshes. This is simple but exposed to XSS, so a more secure option for production is an HttpOnly cookie.
- Angular escapes interpolated values by default, which helps prevent XSS, and I did not use `innerHTML` or `bypassSecurityTrust*`.
- Protected routes use `authGuard`, and a 401 on a protected request clears the stored session automatically.
- Forms validate input (email format, password length, and a letter-plus-number rule), while the backend remains the real authority on validation.
- The backend only allows CORS from the frontend origin and rate-limits API requests.

### 10. How does this Angular frontend demonstrate the "Integrative Programming" concepts from this course?

It integrates separate systems into one working application: an Angular client, a REST API, a MySQL database, and an email service, connected through well-defined JSON contracts (the `ApiResponse<T>` interface mirrors the backend DTOs). It uses JWT authentication across the client and server, environment-based configuration, and email verification and password reset flows that span the frontend, backend, and mail service.

## Author

Rex Hipolito, GitHub: [@Rex19com](https://github.com/Rex19com)
