import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // REST Endpoint: Crear una habitación
  @Post()
  create(@Body() roomData: Partial<Room>) {
    return this.roomService.create(roomData);
  }

  // MessagePattern: Crear una habitación (para el Gateway)
  @MessagePattern({ cmd: 'create-room' })
  createRoom(roomData: Partial<Room>) {
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

  // REST Endpoint: Obtener una habitación por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  // MessagePattern: Obtener una habitación por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-room' })
  getRoomById(data: { id: string }) {
    return this.roomService.findOne(data.id);
  }

  // REST Endpoint: Actualizar una habitación
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Room>) {
    return this.roomService.update(id, updateData);
  }

  // MessagePattern: Actualizar una habitación (para el Gateway)
  @MessagePattern({ cmd: 'update-room' })
  updateRoom(data: { id: string; updateData: Partial<Room> }) {
    const { id, updateData } = data;
    return this.roomService.update(id, updateData);
  }

  // REST Endpoint: Eliminar una habitación
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roomService.delete(id);
  }

  // MessagePattern: Eliminar una habitación (para el Gateway)
  @MessagePattern({ cmd: 'delete-room' })
  deleteRoom(data: { id: string }) {
    return this.roomService.delete(data.id);
  }
}