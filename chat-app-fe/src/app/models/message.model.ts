export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    type: 'text' | 'file' | 'image';
    conversationId: string;
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    type: 'individual' | 'group';
    name?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    lastSeen?: Date;
  }
  