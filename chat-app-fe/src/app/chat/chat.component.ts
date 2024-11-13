import { Component } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { RoomsComponent } from '../rooms/rooms.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageComponent, RoomsComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  
}