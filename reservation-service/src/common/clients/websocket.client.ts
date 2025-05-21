import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationEvent {
  userId: string;
  hotelId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
}

@Injectable()
export class WebSocketClient {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  async sendReservationCreated(event: NotificationEvent): Promise<void> {
    const notification = {
      id: uuidv4(),
      message: event.message,
      type: event.type,
      timestamp: new Date(),
      read: false,
      data: event.data,
    };

    await firstValueFrom(
      this.notificationClient.emit('reservation-created', {
        userId: event.userId,
        hotelId: event.hotelId,
        notification,
      })
    );
  }

  async sendReservationUpdated(event: NotificationEvent): Promise<void> {
    const notification = {
      id: uuidv4(),
      message: event.message,
      type: event.type,
      timestamp: new Date(),
      read: false,
      data: event.data,
    };

    await firstValueFrom(
      this.notificationClient.emit('reservation-updated', {
        userId: event.userId,
        hotelId: event.hotelId,
        notification,
      })
    );
  }

  async sendReservationCancelled(event: NotificationEvent): Promise<void> {
    const notification = {
      id: uuidv4(),
      message: event.message,
      type: event.type,
      timestamp: new Date(),
      read: false,
      data: event.data,
    };

    await firstValueFrom(
      this.notificationClient.emit('reservation-cancelled', {
        userId: event.userId,
        hotelId: event.hotelId,
        notification,
      })
    );
  }

  async sendReservationCheckedIn(event: NotificationEvent): Promise<void> {
    const notification = {
      id: uuidv4(),
      message: event.message,
      type: event.type,
      timestamp: new Date(),
      read: false,
      data: event.data,
    };

    await firstValueFrom(
      this.notificationClient.emit('reservation-checked-in', {
        userId: event.userId,
        hotelId: event.hotelId,
        notification,
      })
    );
  }

  async sendReservationCheckedOut(event: NotificationEvent): Promise<void> {
    const notification = {
      id: uuidv4(),
      message: event.message,
      type: event.type,
      timestamp: new Date(),
      read: false,
      data: event.data,
    };

    await firstValueFrom(
      this.notificationClient.emit('reservation-checked-out', {
        userId: event.userId,
        hotelId: event.hotelId,
        notification,
      })
    );
  }
}
