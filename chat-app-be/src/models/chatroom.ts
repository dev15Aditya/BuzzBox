import { PrismaClient, User } from '@prisma/client';
import { Message } from './message';

export interface ChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const prisma = new PrismaClient();

export class ChatRoomModel {
  static async findMany(userId: string): Promise<ChatRoom[]> {
    return await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: true
          }
        }
      }
    });
  }

  static async findById(id: string): Promise<ChatRoom | null> {
    return await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: true
          }
        }
      }
    });
  }

  static async create(name?: string, isGroup?: boolean, participantIds?: string[]): Promise<ChatRoom> {
    return await prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        participants: {
          connect: participantIds!.map(id => ({ id }))
        }
      },
      include: {
        participants: true,
        messages: {
          include: {
            sender: true
          }
        }
      }
    });
  }
}