import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  phone = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    try{
      this.authService.register(this.username, this.phone, this.password).subscribe((res: any) => {
        if(res.message === 'Login successful') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.user.username);
          this.router.navigate(['/chat']);
        }
      })
 
    } catch(err) {window.alert('Signup failed')}
  }
}
