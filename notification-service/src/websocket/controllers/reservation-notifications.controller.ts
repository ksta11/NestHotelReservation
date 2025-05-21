import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WebSocketService } from '../services/websocket.service';
import { NotificationPayload } from '../interfaces/notification.interface';

@Controller()
export class ReservationNotificationsController {
  constructor(private readonly webSocketService: WebSocketService) {}

  @MessagePattern('reservation-created')
  handleReservationCreated(@Payload() data: NotificationPayload) {
    this.webSocketService.sendReservationCreated(
      data.userId,
      data.hotelId,
      data.notification
    );
  }

  @MessagePattern('reservation-updated')
  handleReservationUpdated(@Payload() data: NotificationPayload) {
    this.webSocketService.sendReservationUpdated(
      data.userId,
      data.hotelId,
      data.notification
    );
  }

  @MessagePattern('reservation-cancelled')
  handleReservationCancelled(@Payload() data: NotificationPayload) {
    this.webSocketService.sendReservationCancelled(
      data.userId,
      data.hotelId,
      data.notification
    );
  }

  @MessagePattern('reservation-checked-in')
  handleReservationCheckedIn(@Payload() data: NotificationPayload) {
    this.webSocketService.sendReservationUpdated(
      data.userId,
      data.hotelId,
      {
        ...data.notification,
        type: 'success',
        message: 'Check-in realizado exitosamente',
      }
    );
  }

  @MessagePattern('reservation-checked-out')
  handleReservationCheckedOut(@Payload() data: NotificationPayload) {
    this.webSocketService.sendReservationUpdated(
      data.userId,
      data.hotelId,
      {
        ...data.notification,
        type: 'info',
        message: 'Check-out realizado exitosamente. ¡Gracias por su estancia!',
      }
    );
  }
}
