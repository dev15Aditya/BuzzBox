import { PrismaClient, User, ChatRoom, Message } from "@prisma/client";

const prisma = new PrismaClient();

  
  export class MessageModel {
    static async findMany(chatRoomId: string): Promise<Message[]> {
      const messages = await prisma.message.findMany({
        where: { chatRoomId },
        include: {
          Sender: true,
          ChatRoom: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return messages.map(message => ({
        ...message,
        sender: {
          ...message,
          password: undefined
        }
      }));
    }
  
    static async create(content: string, chatRoomId: string, senderId: string): Promise<Message> {
      return await prisma.message.create({
        data: {
          content,
          chatRoomId,
          senderId: Number(senderId)
        },
        include: {
          Sender: true,
          ChatRoom: true
        }
      });
    }
  }