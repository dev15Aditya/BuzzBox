import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

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
  private socket: Socket;
  private baseUrl = 'http://localhost:3000/chat';
  private currentChatRoom = new BehaviorSubject<ChatRoom | null>(null);
  private chatMessages = new BehaviorSubject<Message[]>([]);

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      autoConnect: false
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('message', (message: Message) => {
      const currentMessages = this.chatMessages.value;
      this.chatMessages.next([...currentMessages, message]);
    });

    this.socket.on('CHAT_CREATED', (chatRoom: ChatRoom) => {
      // Handle new chat room creation
    });

    this.socket.on('GROUP_CREATED', (chatRoom: ChatRoom) => {
      // Handle new group creation
    });
  }

  connectSocket(): void {
    this.socket.connect();
  }

  disconnectSocket(): void {
    this.socket.disconnect();
  }

  getUserChats(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.baseUrl}/chats`);
  }

  startPersonalChat(otherUserId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.baseUrl}/chats/personal`, { otherUserId });
  }

  createGroupChat(name: string, participantIds: string[]): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.baseUrl}/chats/group`, { name, participantIds });
  }

  sendMessage(chatRoomId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/messages`, { chatRoomId, content });
  }

  getChatHistory(chatRoomId: string, limit = 50, offset = 0): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/messages/${chatRoomId}?limit=${limit}&offset=${offset}`
    );
  }

  setCurrentChatRoom(chatRoom: ChatRoom): void {
    this.currentChatRoom.next(chatRoom);
  }

  getCurrentChatRoom(): Observable<ChatRoom | null> {
    return this.currentChatRoom.asObservable();
  }

  getChatMessages(): Observable<Message[]> {
    return this.chatMessages.asObservable();
  }

  addToGroup(chatRoomId: string, userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.baseUrl}/group/add`, { chatRoomId, userId });
  }

  removeFromGroup(chatRoomId: string, userId: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.baseUrl}/group/remove`, { chatRoomId, userId });
  }
}