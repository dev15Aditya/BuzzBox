import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/chat.interface';
import { AuthService } from '../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  currentUser: string = '';

  constructor(private authService: AuthService, private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUser = user.username || '';
  
      this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.currentUser = user.username || '';
        }
      });
  
      // Fetch all users
      this.authService.getAllUsers().subscribe((users: any) => {
        this.users = users.filter((user: User) => user.username !== this.currentUser);
      });
    }
  }

  // On click navigate to login if not logged in
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToChat(param: number) {
    this.router.navigate(['/chat'], { queryParams: { userId: param } });
  }
  
}
