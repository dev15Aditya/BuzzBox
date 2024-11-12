import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authenticated: boolean = false;
  constructor(
    private authService: AuthService,
  ) {
    this.authenticated = this.authService.isAuthenticated();
  }

  async handleLogout() {
    await this.authService.logout();
    this.authenticated = false;
  }
}
