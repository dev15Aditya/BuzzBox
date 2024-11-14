import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatRoom } from '../models/room.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent {
  @Input() rooms: ChatRoom[] = [];
  // @Output() selectedRoom = new EventEmitter<ChatRoom>();
  @Output() createRoom = new EventEmitter<{ name: string; participantIds: string[]; isGroup: boolean }>();

  // onSelectRoom(room: ChatRoom): void {
  //   this.selectedRoom.emit(room);
  // }

  onCreateRoom(): void {
    const name = prompt('Enter room name');
    const participantIds = ['1', '2']; // Example participant IDs
    const isGroup = confirm('Is this a group chat?');

    if (name) {
      this.createRoom.emit({ name, participantIds, isGroup });
    }
  }
}
