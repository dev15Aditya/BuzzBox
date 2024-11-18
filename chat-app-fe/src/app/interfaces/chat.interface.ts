export interface User {
    id: number;
    username: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    chatRoomId: string;
    createdAt?: Date;
    Sender?: User;
}

export interface ChatRoom {
    id: string;
    name: string;
    isGroup?: boolean;
    Participants?: User[];
    Messages?: Message[];
    type: 'personal' | 'group';
    participants: string[];
}