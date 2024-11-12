import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('message', (message: ChatMessage) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });
  }

  sendMessage(message: string, user: string) {
    const chatMessage: ChatMessage = {
      user,
      message,
      timestamp: new Date()
    };
    this.socket.emit('message', chatMessage);
  }
}