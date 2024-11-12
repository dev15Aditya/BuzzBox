export interface Message {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file';
}