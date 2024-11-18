import { Server, Socket } from 'socket.io';
import { AuthService } from './AuthService';

// Define clear types for socket events and messages
export enum SocketEventType {
    MESSAGE = 'message',
    TYPING = 'typing',
    PRESENCE = 'presence',
    ERROR = 'error'
}

export interface SocketMessage {
    type: SocketEventType;
    data: any;
    timestamp: number;
    roomId?: string;
}

interface TypingStatus {
    roomId: string;
    isTyping: boolean;
}

interface UserPresence {
    userId: number;
    status: 'online' | 'offline';
    lastSeen?: number;
}

export class WebSocketService {
    private static instance: WebSocketService;
    private io: Server | null = null;
    private userSocketMap: Map<number, Set<string>> = new Map(); // Support multiple connections per user
    private socketUserMap: Map<string, number> = new Map();
    private userPresenceMap: Map<number, UserPresence> = new Map();

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
                    return next(new Error('Missing authentication token'));
                }

                const decoded = await AuthService.verifyToken(token);
                if (!decoded?.id) {
                    return next(new Error('Invalid token'));
                }

                socket.data.userId = decoded.id;
                next();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
                next(new Error(errorMessage));
            }
        });

        io.on('connection', this.handleConnection.bind(this));
    }

    private handleConnection(socket: Socket): void {
        const userId = socket.data.userId;
        console.log(`Client connected: ${socket.id} (User: ${userId})`);

        // Initialize user's socket set if not exists
        if (!this.userSocketMap.has(userId)) {
            this.userSocketMap.set(userId, new Set());
        }

        // Add socket to user's connections
        this.userSocketMap.get(userId)?.add(socket.id);
        this.socketUserMap.set(socket.id, userId);

        // Update user presence
        this.updateUserPresence(userId, 'online');

        // Set up event listeners
        this.setupSocketEventListeners(socket);

        // Handle disconnection
        socket.on('disconnect', () => this.handleDisconnection(socket));
    }

    private setupSocketEventListeners(socket: Socket): void {
        const userId = socket.data.userId;

        socket.on('join-room', (roomId: string) => {
            console.log(`User ${userId} joining room ${roomId}`);
            socket.join(roomId);
            this.broadcastToRoom(roomId, {
                type: SocketEventType.PRESENCE,
                data: { userId, action: 'joined' },
                timestamp: Date.now(),
                roomId
            });
        });

        socket.on('leave-room', (roomId: string) => {
            console.log(`User ${userId} leaving room ${roomId}`);
            socket.leave(roomId);
            this.broadcastToRoom(roomId, {
                type: SocketEventType.PRESENCE,
                data: { userId, action: 'left' },
                timestamp: Date.now(),
                roomId
            });
        });

        socket.on('typing', ({ roomId, isTyping }: TypingStatus) => {
            socket.to(roomId).emit('user-typing', {
                userId,
                isTyping,
                timestamp: Date.now()
            });
        });

        // Handle errors
        socket.on('error', (error: Error) => {
            console.error(`Socket Error for user ${userId}:`, error);
            this.sendMessage(userId, {
                type: SocketEventType.ERROR,
                data: { message: 'An error occurred' },
                timestamp: Date.now()
            });
        });
    }

    private handleDisconnection(socket: Socket): void {
        const userId = socket.data.userId;
        console.log(`Client disconnected: ${socket.id} (User: ${userId})`);

        // Remove socket from user's connections
        const userSockets = this.userSocketMap.get(userId);
        if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
                this.userSocketMap.delete(userId);
                this.updateUserPresence(userId, 'offline');
            }
        }

        this.socketUserMap.delete(socket.id);
    }

    private updateUserPresence(userId: number, status: 'online' | 'offline'): void {
        const presence: UserPresence = {
            userId,
            status,
            lastSeen: status === 'offline' ? Date.now() : undefined
        };

        this.userPresenceMap.set(userId, presence);
        this.broadcastPresenceUpdate(presence);
    }

    private broadcastPresenceUpdate(presence: UserPresence): void {
        if (this.io) {
            this.io.emit('presence-update', presence);
        }
    }

    public sendMessage(userId: number, message: SocketMessage): void {
        const userSockets = this.userSocketMap.get(userId);
        if (userSockets && this.io) {
            // Send to all user's connected sockets
            userSockets.forEach(socketId => {
                this.io?.to(socketId).emit('receive-message', {
                    ...message,
                    timestamp: Date.now()
                });
            });
        }
    }

    public broadcastToRoom(roomId: string, message: SocketMessage): void {
        if (this.io) {
            this.io.to(roomId).emit('receive-message', {
                ...message,
                timestamp: Date.now()
            });
        }
    }

    public getUserPresence(userId: number): UserPresence | undefined {
        return this.userPresenceMap.get(userId);
    }

    public isUserOnline(userId: number): boolean {
        const userSockets = this.userSocketMap.get(userId);
        return userSockets !== undefined && userSockets.size > 0;
    }

    public getActiveConnections(userId: number): number {
        return this.userSocketMap.get(userId)?.size ?? 0;
    }
}