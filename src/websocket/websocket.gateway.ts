import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
})
export class WebSocketServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketServerGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
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

      // Enviar el evento de conexión al servicio de notificaciones
      await this.notificationClient.emit('client.connected', { 
        socketId: client.id,
        userId,
        role 
      }).toPromise();

      this.logger.log(`Client connected: ${client.id}, User: ${userId}, Role: ${role}`);

      // Enviar confirmación de conexión exitosa al cliente
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

  async handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = this.jwtService.decode(token);
        if (payload && typeof payload === 'object' && 'sub' in payload) {
          const userId = payload.sub as string;
          
          // Notificar al servicio de notificaciones sobre la desconexión
          await this.notificationClient.emit('client.disconnected', {
            socketId: client.id,
            userId
          }).toPromise();

          this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
        }
      }
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }
}
