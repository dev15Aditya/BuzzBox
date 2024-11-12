import { PrismaClient, User, Message, ChatRoom } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatRoomModel {
  static async findMany(userId: string): Promise<ChatRoom[]> {
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        Participants: {
          some: {
            id: parseInt(userId)
          }
        }
      },
      include: {
        Participants: true,
        Messages: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            Sender: true
          }
        }
      }
    });

    return chatRooms.map(this.mapToChatRoom);
  }

  static async findById(id: string): Promise<ChatRoom | null> {
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        Participants: true,
        Messages: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            Sender: true
          }
        }
      }
    });

    return chatRoom ? this.mapToChatRoom(chatRoom) : null;
  }

  static async create(name?: string, isGroup = false, participantIds?: string[]): Promise<ChatRoom> {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        Participants: {
          connect: participantIds?.map(id => ({ id: parseInt(id) }))
        }
      },
      include: {
        Participants: true,
        Messages: {
          include: {
            Sender: true
          }
        }
      }
    });

    return this.mapToChatRoom(chatRoom);
  }

  private static mapToChatRoom(prismaChatRoom: ChatRoom & { Participants: User[]; Messages: Message[] }): ChatRoom {
    return {
      id: prismaChatRoom.id,
      name: prismaChatRoom.name,
      isGroup: prismaChatRoom.isGroup,
      // participants: prismaChatRoom.Participants,
      // messages: prismaChatRoom.Messages,
      createdAt: prismaChatRoom.createdAt,
      updatedAt: prismaChatRoom.updatedAt
    };
  }
}