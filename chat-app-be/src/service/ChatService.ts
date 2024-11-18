import { ChatRoom, Message, PrismaClient } from "@prisma/client";
import { WebSocketService } from "./SocketService";

const prisma = new PrismaClient();

export class ChatService {
    private wsManager: WebSocketService;

    constructor() {
        this.wsManager = WebSocketService.getInstance();
    }

    // 1-1 chat room
    async getOrCreatePersonalChat(user1: number, user2: number): Promise<ChatRoom> {
        const existingRoom = await prisma.chatRoom.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { Participants: { some: { id: user1 } } },
                    { Participants: { some: { id: user2 } } }
                ]
            },
            include: {
                Participants: true
            }
        });

        if (existingRoom) {
            return existingRoom;
        }

        // create a new chat room
        return await prisma.chatRoom.create({
            data: {
                isGroup: false,
                Participants: {
                    connect: [
                        { id: user1 },
                        { id: user2 }
                    ]
                }
            },
            include: {
                Participants: true
            }
        })
    }

    // Group chat
    async createGroupChat(name: string, participantId: number[]): Promise<ChatRoom> {
        return await prisma.chatRoom.create({
            data: {
                name,
                isGroup: true,
                Participants: {
                    connect: participantId.map(id => ({ id }))
                }
            },
            include: {
                Participants: true
            }
        })
    }

    // send message
    async sendMessage(senderId: number, chatRoomId: string, content: string): Promise<Message> {
        // create a message
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                chatRoomId
            },
            include: {
                Sender: true,
                ChatRoom: {
                    include: {
                        Participants: true
                    }
                }
            }
        });

        // notify all participants
        message.ChatRoom.Participants.forEach(participant => {
            if (participant.id != senderId) {
                this.wsManager.sendMessage(participant.id, {
                    type: 'NEW_MESSAGE',
                    data: message
                });
            }
        });

        return message;
    }

    // Get chat history
    async getChatHistory(chatRoomId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
        return await prisma.message.findMany({
            where: {
                chatRoomId
            },
            include: {
                Sender: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        });
    }

    // Get user's chat rooms
    async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
        return await prisma.chatRoom.findMany({
            where: {
                Participants: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                Participants: true,
                Messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });
    }

    // Add participant to group
    async addToGroup(chatRoomId: string, userId: number): Promise<ChatRoom> {
        const chatRoom = await prisma.chatRoom.findFirst({
            where: {
                id: chatRoomId,
                isGroup: true
            }
        });

        if (!chatRoom) {
            throw new Error('Group chat not found');
        }

        return await prisma.chatRoom.update({
            where: {
                id: chatRoomId
            },
            data: {
                Participants: {
                    connect: {
                        id: userId
                    }
                }
            },
            include: {
                Participants: true
            }
        });
    }

    // Remove participant from group
    async removeFromGroup(chatRoomId: string, userId: number): Promise<ChatRoom> {
        const chatRoom = await prisma.chatRoom.findFirst({
            where: {
                id: chatRoomId,
                isGroup: true
            }
        });

        if (!chatRoom) {
            throw new Error('Group chat not found');
        }

        return await prisma.chatRoom.update({
            where: {
                id: chatRoomId
            },
            data: {
                Participants: {
                    disconnect: {
                        id: userId
                    }
                }
            },
            include: {
                Participants: true
            }
        });
    }
}