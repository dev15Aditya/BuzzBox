import { PrismaClient, User } from "@prisma/client";
import { ChatRoom } from "./chatroom";

const prisma = new PrismaClient();

export interface Message {
    id: string;
    content: string;
    sender: User;
    chatRoom: ChatRoom;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export class MessageModel {
    static async findMany(chatRoomId: string): Promise<Message[]> {
      const messages = await prisma.message.findMany({
        where: { chatRoomId },
        include: {
          sender: true,
          chatRoom: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return messages.map(message => ({
        ...message,
        sender: {
          ...message.sender,
          password: undefined
        }
      }));
    }
  
    static async create(content: string, chatRoomId: string, senderId: string): Promise<Message> {
      return await prisma.message.create({
        data: {
          content,
          chatRoomId,
          senderId
        },
        include: {
          sender: true,
          chatRoom: true
        }
      });
    }
  }