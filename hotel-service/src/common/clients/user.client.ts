import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserClient {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {}
  /**
   * Crea un administrador de hotel
   * @param userId ID del usuario que será administrador
   * @param hotelId ID del hotel
   * @returns Promise con el administrador de hotel creado
   */  async createHotelAdmin(userId: string, hotelId: string): Promise<any> {
    console.log(`Intentando crear hotel_admin para userId: ${userId}, hotelId: ${hotelId}`);
    try {
      const result = await firstValueFrom(
        this.client.send(
          { cmd: 'create-hotel-admin' },
          { userId, hotelId }
        )
      );
      console.log(`Hotel_admin creado exitosamente:`, result);
      return result;
    } catch (error) {
      console.error(`Error al crear hotel_admin: ${error.message}`);
      console.error(error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los hoteles administrados por un usuario
   * @param userId ID del usuario
   * @returns Promise con la lista de registros hotel_admin asociados al usuario
   */
  async getHotelsByAdmin(userId: string): Promise<any[]> {
    return firstValueFrom(
      this.client.send(
        { cmd: 'get-hotel-admins-by-user' },
        { userId }
      )
    );
  }
  
  /**
   * Verifica si un usuario es administrador de un hotel específico
   * @param userId ID del usuario
   * @param hotelId ID del hotel
   * @returns Promise<boolean> que indica si el usuario es administrador del hotel
   */
  async isHotelAdmin(userId: string, hotelId: string): Promise<boolean> {
    try {
      const hotelAdmins = await this.getHotelsByAdmin(userId);
      return hotelAdmins.some(admin => admin.hotelId === hotelId);
    } catch (error) {
      return false;
    }
  }
}
