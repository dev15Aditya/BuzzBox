import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatMessage, ChatService } from '../services/socket.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
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
