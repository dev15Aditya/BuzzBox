import { ChatRoom, Message, PrismaClient, User } from "@prisma/client";
import { SocketEventType, WebSocketService } from "./SocketService";
import { UserModel } from "../models/user";

const prisma = new PrismaClient();

export class ChatService {
    private wsManager: WebSocketService;

    constructor() {
        this.wsManager = WebSocketService.getInstance();
    }

    // Get display name for a chat room based on the viewing user
    private async getChatRoomDisplayName(room: ChatRoom & { Participants: any[] }, viewerId: number): Promise<string> {
        if (room.isGroup) {
            return room.name!;
        }

        // For 1-1 chat, find the other participant and return their name
        const otherParticipant = room.Participants.find(p => p.id !== viewerId);
        return otherParticipant ? otherParticipant.name : 'Unknown User';
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
                    type: SocketEventType.MESSAGE,
                    data: message,
                    timestamp: Date.now(),
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
    // async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
    //     return await prisma.chatRoom.findMany({
    //         where: {
    //             Participants: {
    //                 some: {
    //                     id: userId
    //                 }
    //             }
    //         },
    //         include: {
    //             Participants: true,
    //             Messages: {
    //                 orderBy: {
    //                     createdAt: 'desc'
    //                 },
    //                 take: 1
    //             }
    //         }
    //     });
    // }
    async getUserChatRooms(userId: number): Promise<ChatRoom[]> {
        const rooms = await prisma.chatRoom.findMany({
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

        // Add display names for each room
        const roomsWithDisplayNames = await Promise.all(
            rooms.map(async (room) => ({
                ...room,
                displayName: await this.getChatRoomDisplayName(room, userId)
            }))
        );

        return roomsWithDisplayNames;
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

    // Gets users available for chatting with the current user
    async getAvailableUsers(userId: number): Promise<UserModel[]> {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                }
            }
        });

        return users.map((user: User) => {
            return { id: user.id, username: user.username, phone: user.phone };
        });
    }
}