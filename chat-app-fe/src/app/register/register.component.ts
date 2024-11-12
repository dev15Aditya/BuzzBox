import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ){
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }


  async onSubmit() {
    if(this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        await this.authService.register(
          this.registerForm.get('username')?.value,
          this.registerForm.get('phone')?.value,
          this.registerForm.get('password')?.value
        )
        this.router.navigate(['/chat']);
      } catch(err: any) {
        this.errorMessage = err as string;
      } finally {
        this.loading = false;
      }
    }
  }
}
