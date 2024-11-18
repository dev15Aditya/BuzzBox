import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  phone = '';
  password = '';
  loggedIn$ = this.authService.isAuthenticated$; 

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    try{
      this.authService.register(this.username, this.phone, this.password);
      
      if (this.loggedIn$) {
        this.router.navigate(['/']);
      }
    } catch(err) {window.alert('Signup failed')}
  }
}
