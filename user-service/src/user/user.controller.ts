import { Controller, Get, Post, Body, Param, ConflictException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // REST Endpoint: Crear un usuario
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // MessagePattern: Crear un usuario (para el Gateway)
  @MessagePattern({ cmd: 'create-user' })
  async createUser(user: Partial<User>) {
    return this.userService.create(user);
  }

  // REST Endpoint: Obtener todos los usuarios
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // MessagePattern: Obtener todos los usuarios (para el Gateway)
  @MessagePattern({ cmd: 'get-users' })
  getUsers() {
    return this.userService.findAll();
  }

  // REST Endpoint: Obtener un usuario por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // MessagePattern: Obtener un usuario por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-user' })
  getUserById(data: { id: string }) {
    return this.userService.findOne(data.id);
  }

  // Obtener un usuario por email
  @MessagePattern({ cmd: 'get-user-by-email' })
  getUserByEmail(data: { email: string }) {
    return this.userService.findByEmail(data.email);
  }
}