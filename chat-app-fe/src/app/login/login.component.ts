import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  loggedIn$ = this.authService.isAuthenticated$; 

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    try{
      this.authService.login(this.username, this.password);

      if (this.loggedIn$) {
        this.router.navigate(['/']);
      }
    } catch(err) {
      window.alert('Login failed')
    }
  }
}
