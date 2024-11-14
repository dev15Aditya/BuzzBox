import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authenticated: boolean = false;
  constructor(
    private authService: AuthService,
  ) {
    this.authenticated = this.authService.isAuthenticated();
  }
}
