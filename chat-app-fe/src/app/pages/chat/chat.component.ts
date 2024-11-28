import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  users: any[] = []
  currUser: string = ""

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit() {
    if(localStorage.getItem('token')){
      this.chatService.getUserForChat().subscribe(response => {
        console.log(response)
        // this.currUser = localStorage.getItem('username') || ""
        this.users = response
      });
    }
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
