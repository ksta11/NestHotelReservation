import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from '../services/websocket.service';
import { Logger, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verificar el token JWT
      const payload = await this.jwtService.verifyAsync(token);
      const { sub: userId, role } = payload;

      // Registrar el cliente
      this.webSocketService.registerClient(client, userId, role);
      
      this.logger.log(`Client connected: ${client.id}, User: ${userId}, Role: ${role}`);
      
      // Enviar confirmación de conexión exitosa
      client.emit('connection_established', {
        message: 'Successfully connected to notification system',
        userId,
        role,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = this.jwtService.decode(token);
        if (payload && typeof payload === 'object' && 'sub' in payload) {
          const userId = payload.sub as string;
          this.webSocketService.removeClient(client, userId);
          this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  @SubscribeMessage('subscribe_notifications')
  handleSubscribeNotifications(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      this.logger.log(`User ${payload.sub} subscribed to notifications`);
      
      return { event: 'subscribe_notifications', data: { success: true } };
    } catch (error) {
      this.logger.error(`Subscription error: ${error.message}`);
      return { event: 'subscribe_notifications', data: { success: false, error: error.message } };
    }
  }
}