import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatMessage, ChatService } from '../services/socket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages$: Observable<ChatMessage[]>;
  messageForm: FormGroup;
  username: string = '';

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    this.messages$ = this.chatService.messages$;
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.username = 'User' + Math.floor(Math.random() * 1000);
  }

  sendMessage() {
    if (this.messageForm.valid) {
      const message = this.messageForm.get('message')?.value;
      this.chatService.sendMessage(message, this.username);
      this.messageForm.reset();
    }
  }
}