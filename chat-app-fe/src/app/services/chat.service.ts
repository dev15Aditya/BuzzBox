import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface ChatRoom {
  id: string;
  name: string;
  type: 'personal' | 'group';
  participants: any[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:3000/chat';

  constructor(private http: HttpClient) {}
  
  getUserForChat() {
    return this.http.get(`${this.baseUrl}/getUsers`)
      .pipe(map((response: any) => response));
  }
}