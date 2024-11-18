import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatRoom, Message } from '../interfaces/chat.interface';
import { Subscription } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  chatRooms: ChatRoom[] = [];
  currentRoom: ChatRoom | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  private subscriptions: Subscription[] = [];
  currentUser: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  ngOnInit(): void {
    this.chatService.connectSocket();
    this.loadChatRooms();
    
    this.subscriptions.push(
      this.chatService.getCurrentChatRoom().subscribe(room => {
        this.currentRoom = room;
        if (room) {
          this.loadMessages(room.id);
        }
      }),
      
      this.chatService.getChatMessages().subscribe(messages => {
        this.messages = messages;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnectSocket();
  }

  loadChatRooms(): void {
    this.chatService.getUserChats().subscribe(
      rooms => this.chatRooms = rooms,
      error => console.error('Error loading chat rooms:', error)
    );
  }

  loadMessages(chatRoomId: string): void {
    this.chatService.getChatHistory(chatRoomId).subscribe(
      messages => this.messages = messages,
      error => console.error('Error loading messages:', error)
    );
  }

  selectRoom(room: ChatRoom): void {
    this.chatService.setCurrentChatRoom(room);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentRoom) return;

    this.chatService.sendMessage(this.currentRoom.id, this.newMessage).subscribe(
      message => {
        this.newMessage = '';
      },
      error => console.error('Error sending message:', error)
    );
  }

  startPersonalChat(userId: string): void {
    this.chatService.startPersonalChat(userId).subscribe(
      room => {
        this.chatRooms = [...this.chatRooms, room];
        this.selectRoom(room);
      },
      error => console.error('Error starting chat:', error)
    );
  }

  createGroupChat(name: string, participantIds: string[]): void {
    this.chatService.createGroupChat(name, participantIds).subscribe(
      room => {
        this.chatRooms = [...this.chatRooms, room];
        this.selectRoom(room);
      },
      error => console.error('Error creating group:', error)
    );
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUser.id;
  }
}
