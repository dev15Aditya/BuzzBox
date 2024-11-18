import { Server, Socket } from 'socket.io';
import { AuthService } from './AuthService';

interface SocketMessage {
    type: string;
    data: any;
}

export class WebSocketService {
    private static instance: WebSocketService;
    private io: Server | null = null;
    private userSocketMap: Map<number, string> = new Map();
    private socketUserMap: Map<string, number> = new Map();

    private constructor() {}

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public initialize(io: Server): void {
        this.io = io;

        io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = await AuthService.verifyToken(token);
                socket.data.userId = decoded?.id;
                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });

        io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);
            const userId = socket.data.userId;

            // Store socket mapping
            this.userSocketMap.set(userId, socket.id);
            this.socketUserMap.set(socket.id, userId);

            // Handle joining chat rooms
            socket.on('join-room', (roomId: string) => {
                console.log(`User ${userId} joining room ${roomId}`);
                socket.join(roomId);
            });

            // Handle leaving chat rooms
            socket.on('leave-room', (roomId: string) => {
                console.log(`User ${userId} leaving room ${roomId}`);
                socket.leave(roomId);
            });

            // Handle typing status
            socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
                socket.to(roomId).emit('user-typing', {
                    userId,
                    isTyping
                });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                this.userSocketMap.delete(userId);
                this.socketUserMap.delete(socket.id);
            });
        });
    }

    // Send message to specific user
    public sendMessage(userId: number, message: SocketMessage): void {
        const socketId = this.userSocketMap.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit('receive-message', message);
        }
    }

    // Broadcast message to room
    public broadcastToRoom(roomId: string, message: SocketMessage): void {
        if (this.io) {
            this.io.to(roomId).emit('receive-message', message);
        }
    }

    // Get connected socket for user
    public getUserSocketId(userId: number): string | undefined {
        return this.userSocketMap.get(userId);
    }

    // Check if user is online
    public isUserOnline(userId: number): boolean {
        return this.userSocketMap.has(userId);
    }
}