import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HotelClient {
  constructor(
    @Inject('HOTEL_SERVICE') private readonly hotelServiceClient: ClientProxy,
  ) {}
  /**
   * Obtiene los detalles de una habitación por su ID
   * @param roomId ID de la habitación
   * @returns Detalles de la habitación o null si no se encuentra
   */
  async getRoomById(roomId: string): Promise<any> {
    try {
      console.log(`Solicitando habitación con ID: ${roomId}`);
      const response = await firstValueFrom(
        this.hotelServiceClient.send({ cmd: 'get-room' }, { id: roomId })
      );
      
      console.log(`Respuesta completa de la habitación: ${JSON.stringify(response, null, 2)}`);
      
      // Si la respuesta incluye el objeto hotel completo, asegurémonos de aplanar la estructura
      if (response && response.hotel && typeof response.hotel === 'object') {
        // Aplanar la estructura para facilitar el acceso a los datos
        const flatResponse = {
          ...response,
          hotelId: response.hotel.id,
          hotel: undefined // Eliminamos el objeto anidado para evitar confusiones
        };
        console.log(`Respuesta aplanada: ${JSON.stringify(flatResponse, null, 2)}`);
        return flatResponse;
      }
      
      return response;
    } catch (error) {
      console.error(`Error al obtener habitación con ID ${roomId}:`, error);
      return null;
    }
  }  /**
   * Obtiene una habitación por su número dentro de un hotel específico
   * @param hotelId ID del hotel
   * @param roomNumber Número de la habitación
   * @returns Detalles de la habitación o null si no se encuentra
   */
  async getRoomByNumber(hotelId: string, roomNumber: string): Promise<any> {
    try {
      console.log(`Conectando con servicio de hotel para obtener habitación número ${roomNumber} en hotel ${hotelId}`);
      console.log(`Usando configuración: HOTEL_SERVICE_HOST=${process.env.HOTEL_SERVICE_HOST}, HOTEL_SERVICE_PORT=${process.env.HOTEL_SERVICE_PORT}`);
      
      const result = await firstValueFrom(
        this.hotelServiceClient.send(
          { cmd: 'get-room-by-number' },
          { hotelId, roomNumber }
        )
      );
      
      console.log(`Respuesta del servicio de hotel: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (error) {
      console.error(`Error al obtener habitación número ${roomNumber} en hotel ${hotelId}:`, error);
      console.error(`Detalles del error:`, error.stack || error.message || error);
      return null;
    }
  }
  
  /**
   * Obtiene información completa y garantizada de una habitación
   * Este método asegura que todos los campos necesarios estén presentes
   * @param roomId ID de la habitación
   * @returns Objeto con la información garantizada de la habitación
   */
  async getRoomDetails(roomId: string): Promise<any> {
    try {
      console.log(`Solicitando detalles completos para habitación con ID: ${roomId}`);
      
      // Intentamos obtener los datos de la habitación
      const room = await this.getRoomById(roomId);
      
      // Si no hay respuesta, devolvemos un objeto con valores predeterminados
      if (!room) {
        console.log(`No se encontró la habitación con ID: ${roomId}`);
        return {
          id: roomId,
          roomNumber: 'No disponible',
          roomType: 'No disponible',
          price: 0,
          description: 'Información no disponible',
          state: 'unknown'
        };
      }
      
      // Asegurar que todos los campos necesarios existan con valores predeterminados si es necesario
      const guaranteedRoom = {
        id: room.id || roomId,
        roomNumber: room.roomNumber || 'No disponible',
        roomType: room.roomType || 'No disponible', 
        price: typeof room.price === 'number' ? room.price : 0,
        description: room.description || 'Sin descripción',
        state: room.state || 'unknown',
        hotelId: room.hotelId || (room.hotel ? room.hotel.id : null)
      };
      
      console.log(`Datos de habitación garantizados: ${JSON.stringify(guaranteedRoom, null, 2)}`);
      return guaranteedRoom;
    } catch (error) {
      console.error(`Error al obtener detalles garantizados de habitación con ID ${roomId}:`, error);
      return {
        id: roomId,
        roomNumber: 'Error',
        roomType: 'Error al cargar datos',
        price: 0,
        description: 'Error al cargar información',
        state: 'unknown'
      };
    }
  }

  /**
   * Actualiza el estado de una habitación
   * @param roomId ID de la habitación
   * @param state Nuevo estado de la habitación ('available', 'occupied', 'maintenance', 'reserved', 'temp_reserved')
   * @returns Objeto de la habitación actualizada o null si hubo un error
   */
  async updateRoomState(roomId: string, state: string): Promise<any> {
    try {
      console.log(`Actualizando estado de habitación ${roomId} a ${state}`);
      const response = await firstValueFrom(
        this.hotelServiceClient.send({ cmd: 'update-room-state' }, { id: roomId, state })
      );
      
      console.log(`Respuesta de actualización de estado de habitación: ${JSON.stringify(response, null, 2)}`);
      return response;
    } catch (error) {
      console.error(`Error al actualizar estado de habitación ${roomId}:`, error);
      return null;
    }
  }

  /**
   * Obtiene los detalles de un hotel por su ID
   * @param hotelId ID del hotel
   * @returns Detalles del hotel o null si no se encuentra
   */
  async getHotelById(hotelId: string): Promise<any> {
    try {
      console.log(`Solicitando hotel con ID: ${hotelId}`);
      const response = await firstValueFrom(
        this.hotelServiceClient.send({ cmd: 'get-hotel' }, { id: hotelId })
      );
      
      return response;
    } catch (error) {
      console.error(`Error al obtener hotel con ID ${hotelId}:`, error);
      return null;
    }
  }
}
