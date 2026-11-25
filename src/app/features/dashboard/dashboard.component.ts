import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
