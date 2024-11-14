import { Component, OnInit } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { ChatRoom } from '../models/room.model';
import { Message } from '../models/message.model';
import { ChatRoomService } from '../services/chat-room.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, MessageComponent, RoomsComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatRooms: ChatRoom[] = [];
  selectedRoom: ChatRoom | null = null;
  messages: Message[] = [];

  constructor(private chatRoomService: ChatRoomService) {}

  ngOnInit(): void {
    // Subscribe to chat rooms list
    this.chatRoomService.chatRooms$.subscribe((rooms: ChatRoom[]) => {
      this.chatRooms = rooms;
    });

    // Load rooms initially
    this.chatRoomService.loadChatRooms();
  }

  // Select a chat room and load its messages
  selectRoom(room: ChatRoom): void {
    this.selectedRoom = room;
    this.loadMessages(room.id);
  }

  // Load messages for the selected room
  loadMessages(roomId: string): void {
    this.chatRoomService.getMessages(roomId).subscribe((messages: Message[]) => {
      this.messages = messages;
    });
  }

  // Send a message to the selected room
  sendMessage(content: string): void {
    if (!this.selectedRoom) return;

    this.chatRoomService.sendMessage(this.selectedRoom.id, content).subscribe((newMessage: Message) => {
      this.messages.push(newMessage); // Update messages in the current room
    });
  }

  // Handle room creation by calling the service method
  createRoom(name: string, participantIds: string[], isGroup: boolean): void {
    this.chatRoomService.createChatRoom(name, participantIds, isGroup).subscribe((newRoom: ChatRoom) => {
      this.chatRooms.push(newRoom); // Add the new room to the list
    });
  }
}
