import { Controller, Get, Post, Put, Param, Body, Inject, HttpException, HttpStatus, Delete, Patch, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('hotels')
export class HotelController {
  constructor(
    @Inject('HOTEL_SERVICE') private readonly hotelServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  async getHotels() {
    return this.hotelServiceClient.send({ cmd: 'get-hotels' }, {});
  }

  @Post()
  async createHotel(@Body() createHotelDto: any) {
    return this.hotelServiceClient.send({ cmd: 'create-hotel' }, createHotelDto);
  }
  
  @Get('by-user/:userId')
  async getHotelByUserId(@Param('userId') userId: string) {
    try {
      // Paso 1: Obtener los registros de hotel_admin asociados al usuario
      const hotelAdmins = await firstValueFrom(
        this.userServiceClient.send({ cmd: 'get-hotel-admins-by-user' }, { userId })
      );

      // Verificar si hay al menos un registro de hotel_admin
      if (!hotelAdmins || hotelAdmins.length === 0) {
        throw new HttpException('El usuario no es administrador de ningún hotel', HttpStatus.NOT_FOUND);
      }

      // Paso 2: Obtener el ID del hotel (asumiendo que solo hay uno por usuario)
      const hotelId = hotelAdmins[0].hotelId;

      if (!hotelId) {
        throw new HttpException('No se encontró un hotel asociado a este usuario', HttpStatus.NOT_FOUND);
      }

      // Paso 3: Obtener los detalles completos del hotel
      return this.hotelServiceClient.send({ cmd: 'get-hotel' }, { id: hotelId });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al obtener el hotel del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Get(':id')
  async getHotelById(@Param('id') id: string) {
    return this.hotelServiceClient.send({ cmd: 'get-hotel' }, { id });
  }
  
  @Put(':id')
  async updateHotel(@Param('id') id: string, @Body() updateHotelDto: any) {
    return this.hotelServiceClient.send(
      { cmd: 'update-hotel' }, 
      { id, updateHotelDto }
    );
  }
  
  // RUTAS PARA HABITACIONES (ROOMS)
    @Post(':hotelId/rooms')
  async createRoom(@Param('hotelId') hotelId: string, @Body() createRoomDto: any) {
    console.log('Gateway recibiendo solicitud createRoom con hotelId:', hotelId);
    console.log('createRoomDto:', createRoomDto);
    
    // Asegurarse de que el hotelId del parámetro de ruta se use
    const roomData = {
      ...createRoomDto,
      hotelId: hotelId
    };
    
    console.log('Enviando al microservicio:', roomData);
    return this.hotelServiceClient.send({ cmd: 'create-room' }, roomData);
  }

  @Get(':hotelId/rooms')
  async getRoomsByHotel(@Param('hotelId') hotelId: string) {
    return this.hotelServiceClient.send({ cmd: 'get-rooms-by-hotel' }, { hotelId });
  }
  @Get(':hotelId/rooms/available')
  async getAvailableRooms(@Param('hotelId') hotelId: string) {
    return this.hotelServiceClient.send({ cmd: 'get-available-rooms' }, { hotelId });
  }

  @Get(':hotelId/rooms/by-state/:state')
  async getRoomsByState(
    @Param('hotelId') hotelId: string,
    @Param('state') state: string
  ) {
    return this.hotelServiceClient.send(
      { cmd: 'get-rooms-by-state' }, 
      { state, hotelId }
    );
  }

  @Get(':hotelId/rooms/:id')
  async getRoomById(@Param('hotelId') hotelId: string, @Param('id') id: string) {
    return this.hotelServiceClient.send({ cmd: 'get-room' }, { id, hotelId });  }  @Put(':hotelId/rooms/:id')
  async updateRoom(
    @Param('hotelId') hotelId: string, 
    @Param('id') id: string, 
    @Body() updateRoomDto: any
  ) {
    console.log('Gateway recibiendo solicitud updateRoom:', {
      hotelId,
      id,
      updateRoomDto
    });
    
    const payload = { id, hotelId, updateDto: updateRoomDto };
    console.log('Enviando al microservicio:', payload);
    
    try {
      const result = await firstValueFrom(
        this.hotelServiceClient.send(
          { cmd: 'update-room' },
          payload
        )
      );
      console.log('Respuesta del microservicio:', result);
      return result;
    } catch (error) {
      console.error('Error al actualizar habitación:', error);
      throw new HttpException(
        error.message || 'Error al actualizar la habitación',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Delete(':hotelId/rooms/:id')
  async deleteRoom(@Param('hotelId') hotelId: string, @Param('id') id: string) {
    console.log('Gateway recibiendo solicitud deleteRoom:', {
      hotelId,
      id
    });
    
    const payload = { id, hotelId };
    console.log('Enviando al microservicio:', payload);
    
    return this.hotelServiceClient.send({ cmd: 'delete-room' }, payload);
  }
    @Put(':hotelId/rooms/:id/state')
  async changeRoomState(
    @Param('hotelId') hotelId: string,
    @Param('id') id: string,
    @Body() data: { state: string }
  ) {
    return this.hotelServiceClient.send(
      { cmd: 'change-room-state' },
      { id, hotelId, state: data.state }
    );
  }
  @Put(':hotelId/rooms/:id/available')
  async setRoomAvailable(
    @Param('hotelId') hotelId: string,
    @Param('id') id: string
  ) {
    return this.hotelServiceClient.send(
      { cmd: 'set-room-available' },
      { id, hotelId }
    );
  }
  @Put(':hotelId/rooms/:id/occupied')
  async setRoomOccupied(
    @Param('hotelId') hotelId: string,
    @Param('id') id: string
  ) {
    return this.hotelServiceClient.send(
      { cmd: 'set-room-occupied' },
      { id, hotelId }
    );
  }
  @Put(':hotelId/rooms/:id/maintenance')
  async setRoomMaintenance(
    @Param('hotelId') hotelId: string,
    @Param('id') id: string
  ) {
    return this.hotelServiceClient.send(
      { cmd: 'set-room-maintenance' },
      { id, hotelId }
    );
  }
}

@Controller('reservations')
export class ReservationController {
  constructor(
    @Inject('RESERVATION_SERVICE') private readonly reservationServiceClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('HOTEL_SERVICE') private readonly hotelServiceClient: ClientProxy,
  ) {}
  
  /**
   * Verifica si existe una reserva para la misma habitación en el mismo período de fechas
   * @param roomId ID de la habitación
   * @param checkInDate Fecha de entrada
   * @param checkOutDate Fecha de salida
   * @returns true si hay conflicto, false si no hay conflicto
   */
  private async checkReservationConflict(
    roomId: string,
    checkInDate: Date | string,
    checkOutDate: Date | string
  ): Promise<boolean> {
    try {
      // Convertir las fechas a objetos Date si son string
      const checkIn = typeof checkInDate === 'string' ? new Date(checkInDate) : checkInDate;
      const checkOut = typeof checkOutDate === 'string' ? new Date(checkOutDate) : checkOutDate;
      
      // Validar que las fechas sean válidas
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        throw new HttpException('Las fechas proporcionadas no son válidas', HttpStatus.BAD_REQUEST);
      }
      
      // Validar que la fecha de entrada sea anterior a la de salida
      if (checkIn >= checkOut) {
        throw new HttpException(
          'La fecha de entrada debe ser anterior a la fecha de salida', 
          HttpStatus.BAD_REQUEST
        );
      }

      // Buscar reservas existentes para la habitación y verificar solapamientos
      const existingReservations = await firstValueFrom(
        this.reservationServiceClient.send(
          { cmd: 'check-reservation-conflicts' },
          { 
            roomId,
            checkInDate: checkIn.toISOString(),
            checkOutDate: checkOut.toISOString()
          }
        )
      );
      
      return existingReservations && existingReservations.length > 0;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al verificar disponibilidad de la habitación',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getReservations() {
    return this.reservationServiceClient.send({ cmd: 'get-reservations' }, {});
  }
  
  @Get('hotel/:hotelId')
  async getReservationsByHotel(@Param('hotelId') hotelId: string) {
    return this.reservationServiceClient.send(
      { cmd: 'get-reservations-by-hotel' }, 
      { hotelId }
    );
  }
  @Post('hotel/:hotelId')
  async createReservationByHotelAdmin(
    @Param('hotelId') hotelId: string,
    @Body() createReservationDto: any
  ) {
    try {
      // Validar campos requeridos
      if (!createReservationDto.userEmail) {
        throw new HttpException('Se requiere el email del usuario', HttpStatus.BAD_REQUEST);
      }
      
      if (!createReservationDto.roomNumber) {
        throw new HttpException('Se requiere el número de habitación', HttpStatus.BAD_REQUEST);
      }
      
      // 1. Obtener el usuario por email
      const user = await firstValueFrom(
        this.userServiceClient.send(
          { cmd: 'get-user-by-email' },
          { email: createReservationDto.userEmail }
        )
      );

      if (!user) {
        throw new HttpException(
          `No se encontró un usuario con el email: ${createReservationDto.userEmail}`, 
          HttpStatus.NOT_FOUND
        );
      }
      
      // 2. Obtener la habitación por número y hotel ID
      const room = await firstValueFrom(
        this.hotelServiceClient.send(
          { cmd: 'get-room-by-number-and-hotel' },
          { roomNumber: createReservationDto.roomNumber, hotelId }
        )
      );
        if (!room) {
        throw new HttpException(
          `No se encontró una habitación con el número ${createReservationDto.roomNumber} en el hotel especificado`, 
          HttpStatus.NOT_FOUND
        );
      }
        // Verificar si la habitación está disponible en las fechas seleccionadas
      if (createReservationDto.checkInDate && createReservationDto.checkOutDate) {
        const hasConflict = await this.checkReservationConflict(
          room.id,
          createReservationDto.checkInDate,
          createReservationDto.checkOutDate
        );
        
        if (hasConflict) {
          throw new HttpException(
            `La habitación ${createReservationDto.roomNumber} no está disponible en las fechas seleccionadas`, 
            HttpStatus.CONFLICT
          );
        }
      } else {
        throw new HttpException(
          'Se requieren las fechas de entrada y salida', 
          HttpStatus.BAD_REQUEST
        );
      }
      
      // 3. Crear el objeto de reserva con los IDs obtenidos
      const reservationData = {
        ...createReservationDto,
        userId: user.id,
        hotelId: hotelId,
        roomId: room.id,
        // Establecer paymentStatus como "pending" si no viene en el body
        paymentStatus: createReservationDto.paymentStatus || "pending",
        // Eliminamos los campos que no forman parte del modelo de Reservation
        userEmail: undefined,
        roomNumber: undefined
      };
      
      // Crear la reserva
      const reservation = await firstValueFrom(
        this.reservationServiceClient.send(
          { cmd: 'create-reservation' },
          reservationData
        )
      );
      
      // Si la reserva se creó exitosamente, cambiar el estado de la habitación a "reserved"
      if (reservation) {
        await firstValueFrom(
          this.hotelServiceClient.send(
            { cmd: 'change-room-state' },
            { id: room.id, hotelId: hotelId, state: 'reserved' }
          )
        );
      }
      
      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al crear la reserva',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Post()
  async createReservation(@Body() createReservationDto: any) {
    try {
      // Verificar si la habitación está disponible en las fechas seleccionadas
      if (createReservationDto.roomId && createReservationDto.checkInDate && createReservationDto.checkOutDate) {
        const hasConflict = await this.checkReservationConflict(
          createReservationDto.roomId,
          createReservationDto.checkInDate,
          createReservationDto.checkOutDate
        );
        
        if (hasConflict) {
          throw new HttpException(
            `La habitación no está disponible en las fechas seleccionadas`, 
            HttpStatus.CONFLICT
          );
        }
      } else {
        throw new HttpException(
          'Se requieren el ID de habitación y las fechas de entrada y salida', 
          HttpStatus.BAD_REQUEST
        );
      }
      
      // Crear la reserva
      const reservation = await firstValueFrom(
        this.reservationServiceClient.send(
          { cmd: 'create-reservation' },
          createReservationDto
        )
      );
      
      // Si la reserva se creó exitosamente y tenemos el hotelId, cambiar el estado de la habitación a "reserved"
      if (reservation && createReservationDto.hotelId) {
        await firstValueFrom(
          this.hotelServiceClient.send(
            { cmd: 'change-room-state' },
            { id: createReservationDto.roomId, hotelId: createReservationDto.hotelId, state: 'reserved' }
          )
        );
      }
      
      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al crear la reserva',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: any) {
    return this.userServiceClient.send({ cmd: 'create-user' }, createUserDto);
  }

  @Get()
  async getUsers() {
    return this.userServiceClient.send({ cmd: 'get-users' }, {});
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userServiceClient.send({ cmd: 'get-user' }, { id });
  }
}

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('REVIEW_SERVICE') private readonly reviewServiceClient: ClientProxy,
  ) {}

  @Post()
  async createReview(@Body() createReviewDto: any) {
    return this.reviewServiceClient.send({ cmd: 'create-review' }, createReviewDto);
  }

  @Get()
  async getReviews() {
    return this.reviewServiceClient.send({ cmd: 'get-reviews' }, {});
  }

  @Get('hotel/:hotelId')
  async getReviewsByHotel(@Param('hotelId') hotelId: string) {
    return this.reviewServiceClient.send({ cmd: 'get-reviews-by-hotel' }, { hotelId });
  }
}

@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationServiceClient: ClientProxy,
  ) {}

  @Post('email')
  async sendEmail(@Body() emailDto: any) {
    return this.notificationServiceClient.send({ cmd: 'send_email' }, emailDto);
  }
}
