import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { response } from 'express';

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
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    try{
      this.authService.login(this.username, this.password).subscribe((res: any) => {
        console.log(res)
        if(res.message === 'Login successful') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.user.username);
          this.router.navigate(['/chat']);
        }
      })
    } catch(err) {
      window.alert('Login failed')
    }
  }
}
