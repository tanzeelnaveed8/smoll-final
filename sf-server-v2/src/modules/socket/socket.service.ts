import { Injectable } from '@nestjs/common';
import { SocketEventEnum } from './socket-event.enum';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  public socket: Server = null;

  // Map userId to socketId
  private userSocketMap = new Map<string, string>();

  registerUser(userId: string, socketId: string): void {
    this.userSocketMap.set(userId, socketId);
  }

  removeUser(socketId: string): void {
    for (const [userId, sId] of this.userSocketMap.entries()) {
      if (sId === socketId) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  // Emit to specific user
  emitToUser(userId: string, event: SocketEventEnum, data: any): void {
    const socketId = this.userSocketMap.get(userId);
    if (socketId && this.socket) {
      this.socket.to(socketId).emit(event, data);
    }
  }

  // Emit to all users (still available if needed)
  emit(event: SocketEventEnum, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}
