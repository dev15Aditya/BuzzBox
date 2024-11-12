import { Server, Socket } from 'socket.io';
import {v4 as uuidv4} from 'uuid';
import { Message, Room, User } from '../types';

export class SocketEventHandlers {
    constructor(
        private io: Server,
        private activeUsers: Map<string, User>,
        private activeRooms: Map<string, Room>,
    ){}

    handleConnection(socket: Socket, userData: {username: string}) {
        const user: User = {
            id: uuidv4(),
            socketId: socket.id,
            username: userData.username
        };

        this.activeUsers.set(socket.id, user);

        this.io.emit('users:update', Array.from(this.activeUsers.values()));
        socket.emit('user:connected', user);
    }

    handleJoinRoom(socket: Socket, roomId: string) {
        const user = this.activeUsers.get(socket.id);
        if(!user) return;

        // Get or create room
        let room = this.activeRooms.get(roomId);
        if(!room) {
            room = {
                id: roomId,
                name: `Room ${roomId}`,
                users: []
            }
            this.activeRooms.set(roomId, room);
        }

        // Add User to room
        socket.join(roomId);
        user.room = roomId;
        room.users.push(user);
        this.activeRooms.set(roomId, room);

        // Notify room users
        this.io.to(roomId).emit('room:users', room.users);
        socket.to(roomId).emit('user:joined', user);
    }

    handleMessage(socket: Socket, messageData: Partial<Message>) {
        const user = this.activeUsers.get(socket.id);

        if(!user || !user.room) return;

        const message: Message = {
            id: uuidv4(),
            content: messageData.content!,
            senderId: user.id,
            roomId: user.room,
            timestamp: new Date(),
            type: messageData.type || 'text'
        }

        // Broadcast meesage to room
        this.io.to(user.room).emit('message:new', message);
    }

    handleTyping(socket: Socket, roomId: string) {
        const user = this.activeUsers.get(socket.id);
        if(!user || !roomId) return;

        socket.to(roomId).emit('user:typing', user);
    }

    handleLeaveRoom(socket: Socket, roomId: string) {
        const user = this.activeUsers.get(socket.id);
        if(!user) return;

        this.removeUserFromRoom(socket, roomId)
    }

    handleDisconnect(socket: Socket, roomId: string){
        const user = this.activeUsers.get(socket.id);
        if(!user) return;

        // Remove user from room if they are in one
        if(user.room) {
            this.removeUserFromRoom(socket, roomId);
        }

        // Remove user from active users
        this.activeUsers.delete(socket.id);

        // Notify all clients
        this.io.emit('user:update', Array.from(this.activeUsers.values()));
    }

    private removeUserFromRoom(socket: Socket, roomId: string) {
        const room = this.activeRooms.get(roomId);
        const user = this.activeUsers.get(socket.id);
        
        if (room && user) {
          // Remove user from room
          room.users = room.users.filter(u => u.id !== user.id);
          this.activeRooms.set(roomId, room);
          user.room = undefined;
    
          // Leave socket room
          socket.leave(roomId);
    
          // Notify room members
          this.io.to(roomId).emit('room:users', room.users);
          socket.to(roomId).emit('user:left', user);
    
          // Clean up empty rooms
          if (room.users.length === 0) {
            this.activeRooms.delete(roomId);
          }
        }
      }
    
}