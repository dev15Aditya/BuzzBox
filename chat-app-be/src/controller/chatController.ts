import { Request, Response } from 'express';
import { ChatService } from '../service/ChatService';
import { WebSocketService } from '../service/SocketService';

export class ChatController {
    private chatService: ChatService;
    private wsService: WebSocketService;

    constructor() {
        this.chatService = new ChatService();
        this.wsService = WebSocketService.getInstance();
    }

    // Get user's chat rooms
    getUserChats = async (req: Request, res: Response) => {
        try {
            const userId = req.user && req.user.id; // From auth middleware
            const chats = await this.chatService.getUserChatRooms(userId!);
            res.json(chats);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching chats' });
        }
    };

    // Start personal chat
    startPersonalChat = async (req: Request, res: Response) => {
        try {
            const { otherUserId } = req.body;
            const userId = req.user && req.user.id;
            
            const chatRoom = await this.chatService.getOrCreatePersonalChat(userId!, otherUserId);
            
            // If users are online, make them join the room
            if (this.wsService.isUserOnline(userId!)) {
                const socketId = this.wsService.getUserSocketId(userId!);
                if (socketId) {
                    this.wsService.broadcastToRoom(chatRoom.id, {
                        type: 'CHAT_CREATED',
                        data: chatRoom
                    });
                }
            }
            
            res.json(chatRoom);
        } catch (error) {
            res.status(500).json({ message: 'Error creating chat' });
        }
    };

    // Create group chat
    createGroupChat = async (req: Request, res: Response) => {
        try {
            const { name, participantIds } = req.body;
            const chatRoom = await this.chatService.createGroupChat(name, participantIds);
            
            // Notify all online participants
            participantIds.forEach((participantId: number) => {
                if (this.wsService.isUserOnline(participantId)) {
                    this.wsService.sendMessage(participantId, {
                        type: 'GROUP_CREATED',
                        data: chatRoom
                    });
                }
            });
            
            res.json(chatRoom);
        } catch (error) {
            res.status(500).json({ message: 'Error creating group chat' });
        }
    };

    // Send message
    sendMessage = async (req: Request, res: Response) => {
        try {
            const { chatRoomId, content } = req.body;
            const userId = req.user && req.user.id;
            
            const message = await this.chatService.sendMessage(userId!, chatRoomId, content);
            res.json(message);
        } catch (error) {
            res.status(500).json({ message: 'Error sending message' });
        }
    };

    // Get chat history
    getChatHistory = async (req: Request, res: Response) => {
        try {
            const { chatRoomId } = req.params;
            const { limit, offset } = req.query;
            
            const messages = await this.chatService.getChatHistory(
                chatRoomId,
                Number(limit) || 50,
                Number(offset) || 0
            );
            
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching messages' });
        }
    };

    // Add to group
    addToGroup = async (req: Request, res: Response) => {
        try {
            const { chatRoomId, userId } = req.body;
            const updatedRoom = await this.chatService.addToGroup(chatRoomId, userId);
            
            // Notify the added user if online
            if (this.wsService.isUserOnline(userId)) {
                this.wsService.sendMessage(userId, {
                    type: 'ADDED_TO_GROUP',
                    data: updatedRoom
                });
            }
            
            res.json(updatedRoom);
        } catch (error) {
            res.status(500).json({ message: 'Error adding user to group' });
        }
    };

    // Remove from group
    removeFromGroup = async (req: Request, res: Response) => {
        try {
            const { chatRoomId, userId } = req.body;
            const updatedRoom = await this.chatService.removeFromGroup(chatRoomId, userId);
            
            // Notify the removed user if online
            if (this.wsService.isUserOnline(userId)) {
                this.wsService.sendMessage(userId, {
                    type: 'REMOVED_FROM_GROUP',
                    data: updatedRoom
                });
            }
            
            res.json(updatedRoom);
        } catch (error) {
            res.status(500).json({ message: 'Error removing user from group' });
        }
    };
}