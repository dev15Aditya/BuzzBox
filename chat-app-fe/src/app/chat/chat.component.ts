import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService, ChatRoom, Message } from '../services/chat.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  chatRooms: ChatRoom[] = [];
  currentChatRoom: ChatRoom | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;

    // Connect to WebSocket
    this.chatService.connectSocket();

    // Load chat rooms
    this.loadChatRooms();

    // Subscribe to new messages
    this.chatService.getChatMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        if (this.currentChatRoom) {
          this.messages = messages;
          this.scrollToBottom();
        }
      });

    // Handle route parameters for direct chat navigation
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['userId']) {
          this.startPersonalChat(params['userId']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.disconnectSocket();
  }

  private loadChatRooms() {
    this.chatService.getUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(rooms => {
        this.chatRooms = rooms;
      });
  }

  selectChatRoom(room: ChatRoom) {
    this.currentChatRoom = room;
    this.chatService.setCurrentChatRoom(room);
    this.loadChatHistory(room.id);
  }

  private loadChatHistory(chatRoomId: string) {
    this.chatService.getChatHistory(chatRoomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      });
  }

  startPersonalChat(userId: string) {
    this.chatService.startPersonalChat(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chatRoom => {
        this.chatRooms = [...this.chatRooms, chatRoom];
        this.selectChatRoom(chatRoom);
      });
  }

  sendMessage() {
    if (this.currentChatRoom && this.newMessage.trim()) {
      this.chatService.sendMessage(this.currentChatRoom.id, this.newMessage.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.newMessage = '';
        });
    }
  }

  getSenderName(senderId: string): string {
    if (!this.currentChatRoom) return '';
    const sender = this.currentChatRoom.participants.find(p => p.id === senderId);
    return sender ? sender.username : 'Unknown User';
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messageContainer = document.querySelector('.message-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  }
}