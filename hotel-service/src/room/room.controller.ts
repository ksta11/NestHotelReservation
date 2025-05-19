import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Put } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { RoomService, RoomState } from './room.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  // REST Endpoint: Crear una habitación  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    // Creamos un objeto que tenga la estructura correcta de Room
    const roomData: Partial<Room> = {
      ...createRoomDto,
      hotel: { id: createRoomDto.hotelId } as any
    };
    
    // Eliminamos hotelId del objeto roomData para evitar el error
    // Usamos una copia sin tipado para realizar la operación
    const roomDataObj = roomData as any;
    delete roomDataObj.hotelId; // Eliminamos el hotelId que ya no necesitamos
    
    return this.roomService.create(roomData);
  }
  // MessagePattern: Crear una habitación (para el Gateway)
  @MessagePattern({ cmd: 'create-room' })
  createRoom(data: CreateRoomDto) {
    // Primero logs para debugging
    console.log('Recibiendo solicitud create-room', data);
    
    // Creamos un objeto que tenga la estructura correcta de Room
    const roomData: Partial<Room> = {
      ...data,
      hotel: { id: data.hotelId } as any
    };
    
    // Eliminamos hotelId del objeto roomData para evitar el error
    // Usamos una copia sin tipado para realizar la operación
    const roomDataObj = roomData as any;
    delete roomDataObj.hotelId;
    
    return this.roomService.create(roomData);
  }

  // REST Endpoint: Obtener todas las habitaciones
  @Get()
  findAll() {
    return this.roomService.findAll();
  }
  // MessagePattern: Obtener todas las habitaciones (para el Gateway)
  @MessagePattern({ cmd: 'get-rooms' })
  getRooms() {
    return this.roomService.findAll();
  }
  // MessagePattern: Obtener habitaciones por hotel (para el Gateway)
  @MessagePattern({ cmd: 'get-rooms-by-hotel' })
  getRoomsByHotel(data: { hotelId: string }) {
    console.log('Microservicio recibiendo solicitud get-rooms-by-hotel con hotelId:', data.hotelId);
    return this.roomService.findByHotel(data.hotelId);
  }
  
  // MessagePattern: Obtener habitación por número y hotel ID (para el Gateway)
  @MessagePattern({ cmd: 'get-room-by-number-and-hotel' })
  getRoomByNumberAndHotel(data: { roomNumber: string, hotelId: string }) {
    console.log('Microservicio recibiendo solicitud get-room-by-number-and-hotel:', data);
    return this.roomService.findByRoomNumberAndHotelId(data.roomNumber, data.hotelId);
  }

  // REST Endpoint: Obtener una habitación por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }  // MessagePattern: Obtener una habitación por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-room' })
  getRoomById(data: { id: string, hotelId?: string }) {
    // Primero obtenemos la habitación
    return this.roomService.findOne(data.id).then(room => {
      // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel
      if (data.hotelId && room.hotel.id !== data.hotelId) {
        throw new RpcException({
          status: 404,
          message: `Room with ID ${data.id} not found in hotel with ID ${data.hotelId}`,
          error: 'Not Found',
        });
      }
      return room;
    });
  }  // REST Endpoint: Actualizar una habitación
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateRoomDto) {
    return this.roomService.update(id, updateDto);
  }  // MessagePattern: Actualizar una habitación (para el Gateway)
  @MessagePattern({ cmd: 'update-room' })
  updateRoom(data: { id: string; hotelId?: string; updateDto: UpdateRoomDto }) {
    console.log('Microservicio recibiendo solicitud update-room:', JSON.stringify(data, null, 2));
    const { id, hotelId, updateDto } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel antes de actualizarla
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.update(id, updateDto);
      });
    }
    return this.roomService.update(id, updateDto);
  }

  // REST Endpoint: Eliminar una habitación
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roomService.delete(id);
  }  // MessagePattern: Eliminar una habitación (para el Gateway)
  @MessagePattern({ cmd: 'delete-room' })
  deleteRoom(data: { id: string, hotelId?: string }) {
    console.log('Microservicio recibiendo solicitud delete-room:', JSON.stringify(data, null, 2));
    const { id, hotelId } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel antes de eliminarla
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.delete(id);
      });
    }
    return this.roomService.delete(id);
  }

  // REST Endpoint: Obtener habitaciones por estado
  @Get('state/:state')
  findByState(@Param('state') state: RoomState, @Query('hotelId') hotelId?: string) {
    return this.roomService.findByState(state, hotelId);
  }

  // MessagePattern: Obtener habitaciones por estado (para el Gateway)
  @MessagePattern({ cmd: 'get-rooms-by-state' })
  getRoomsByState(data: { state: RoomState; hotelId?: string }) {
    return this.roomService.findByState(data.state, data.hotelId);
  }

  // REST Endpoint: Obtener habitaciones disponibles
  @Get('available')
  findAvailable(@Query('hotelId') hotelId?: string) {
    return this.roomService.findAvailable(hotelId);
  }

  // MessagePattern: Obtener habitaciones disponibles (para el Gateway)
  @MessagePattern({ cmd: 'get-available-rooms' })
  getAvailableRooms(data: { hotelId?: string }) {
    return this.roomService.findAvailable(data.hotelId);
  }
  // REST Endpoint: Cambiar el estado de una habitación
  @Put(':id/state')
  changeState(@Param('id') id: string, @Body() data: { state: RoomState }) {
    return this.roomService.changeState(id, data.state);
  }
  // MessagePattern: Cambiar el estado de una habitación (para el Gateway)
  @MessagePattern({ cmd: 'change-room-state' })
  changeRoomState(data: { id: string; hotelId?: string; state: RoomState }) {
    const { id, hotelId, state } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.changeState(id, state);
      });
    }
    return this.roomService.changeState(id, state);
  }
  // REST Endpoint: Marcar habitación como disponible
  @Put(':id/available')
  setAvailable(@Param('id') id: string) {
    return this.roomService.setAvailable(id);
  }
  // MessagePattern: Marcar habitación como disponible (para el Gateway)
  @MessagePattern({ cmd: 'set-room-available' })
  setRoomAvailable(data: { id: string; hotelId?: string }) {
    const { id, hotelId } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.setAvailable(id);
      });
    }
    return this.roomService.setAvailable(data.id);
  }
  // REST Endpoint: Marcar habitación como ocupada
  @Put(':id/occupied')
  setOccupied(@Param('id') id: string) {
    return this.roomService.setOccupied(id);
  }
  // MessagePattern: Marcar habitación como ocupada (para el Gateway)
  @MessagePattern({ cmd: 'set-room-occupied' })
  setRoomOccupied(data: { id: string; hotelId?: string }) {
    const { id, hotelId } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.setOccupied(id);
      });
    }
    return this.roomService.setOccupied(data.id);
  }
  // REST Endpoint: Marcar habitación como en mantenimiento
  @Put(':id/maintenance')
  setMaintenance(@Param('id') id: string) {
    return this.roomService.setMaintenance(id);
  }
  // MessagePattern: Marcar habitación como en mantenimiento (para el Gateway)
  @MessagePattern({ cmd: 'set-room-maintenance' })
  setRoomMaintenance(data: { id: string; hotelId?: string }) {
    const { id, hotelId } = data;
    // Si se especificó un hotelId, verificamos que la habitación pertenezca a ese hotel
    if (hotelId) {
      return this.roomService.findOne(id).then(room => {
        if (room.hotel.id !== hotelId) {
          throw new RpcException({
            status: 404,
            message: `Room with ID ${id} not found in hotel with ID ${hotelId}`,
            error: 'Not Found',
          });
        }
        return this.roomService.setMaintenance(id);
      });
    }
    return this.roomService.setMaintenance(data.id);
  }
}