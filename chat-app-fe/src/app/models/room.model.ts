import { Message } from "./message.model";
import { User } from "./user.model";

export interface ChatRoom {
    id: string;
    name: string;
    isGroup: boolean;
    participants: User[];
    messages: Message[];
    createdAt: string;
  }