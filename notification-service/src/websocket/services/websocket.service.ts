import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '../interfaces/notification.interface';

@Injectable()
export class WebSocketService {
  private connectedClients: Map<string, Socket> = new Map();
  private userSockets: Map<string, string[]> = new Map();
  
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Registra un nuevo cliente conectado
   * @param client Socket del cliente
   * @param userId ID del usuario
   * @param role Rol del usuario
   */
  registerClient(client: Socket, userId: string, role: string): void {
    this.connectedClients.set(client.id, client);
    
    // Registrar socket para el usuario
    const userSockets = this.userSockets.get(userId) || [];
    userSockets.push(client.id);
    this.userSockets.set(userId, userSockets);
    
    // Unir a las salas correspondientes
    client.join(`user-${userId}`);
    if (role === 'hotel_admin') {
      client.join('admin-room');
    }
  }

  /**
   * Elimina un cliente desconectado
   * @param client Socket del cliente
   * @param userId ID del usuario
   */
  removeClient(client: Socket, userId: string): void {
    this.connectedClients.delete(client.id);
    
    // Eliminar socket de la lista del usuario
    const userSockets = this.userSockets.get(userId) || [];
    const updatedSockets = userSockets.filter(socketId => socketId !== client.id);
    
    if (updatedSockets.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, updatedSockets);
    }
  }

  /**
   * Envía una notificación a un usuario específico
   * @param userId ID del usuario destinatario
   * @param notification Datos de la notificación
   */
  sendToUser(userId: string, notification: Notification): void {
    this.emitToRoom(`user-${userId}`, 'notification', notification);
  }

  /**
   * Envía una notificación a todos los administradores
   * @param notification Datos de la notificación
   */
  sendToAdmins(notification: Notification): void {
    this.emitToRoom('admin-room', 'notification', notification);
  }

  /**
   * Envía una notificación sobre una reserva creada
   * @param userId ID del usuario que creó la reserva
   * @param hotelId ID del hotel
   * @param notification Datos de la notificación
   */
  sendReservationCreated(userId: string, hotelId: string, notification: Notification): void {
    // Notificar al usuario que creó la reserva
    this.sendToUser(userId, notification);
    
    // Notificar a los administradores
    this.sendToAdmins({
      ...notification,
      message: `Nueva reserva creada por usuario ${userId} para el hotel ${hotelId}`,
    });
  }

  /**
   * Envía una notificación sobre una reserva actualizada
   * @param userId ID del usuario dueño de la reserva
   * @param hotelId ID del hotel
   * @param notification Datos de la notificación
   */
  sendReservationUpdated(userId: string, hotelId: string, notification: Notification): void {
    // Notificar al dueño de la reserva
    this.sendToUser(userId, notification);
    
    // Notificar a los administradores
    this.sendToAdmins({
      ...notification,
      message: `Reserva actualizada para usuario ${userId} en el hotel ${hotelId}`,
    });
  }

  /**
   * Envía una notificación sobre una reserva cancelada
   * @param userId ID del usuario dueño de la reserva
   * @param hotelId ID del hotel
   * @param notification Datos de la notificación
   */
  sendReservationCancelled(userId: string, hotelId: string, notification: Notification): void {
    // Notificar al dueño de la reserva
    this.sendToUser(userId, notification);
    
    // Notificar a los administradores
    this.sendToAdmins({
      ...notification,
      message: `Reserva cancelada para usuario ${userId} en el hotel ${hotelId}`,
    });
  }

  /**
   * Emite un evento a una sala específica
   * @param room Nombre de la sala
   * @param event Nombre del evento
   * @param data Datos a enviar
   */
  private emitToRoom(room: string, event: string, data: any): void {
    const sockets = Array.from(this.connectedClients.values());
    sockets.forEach(socket => {
      if (socket.rooms.has(room)) {
        socket.emit(event, data);
      }
    });
  }
}
