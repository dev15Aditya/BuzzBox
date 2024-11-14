import { ChatRoom } from "./room.model";
import { User } from "./user.model";

export interface Message {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
  chatRoom: ChatRoom
}