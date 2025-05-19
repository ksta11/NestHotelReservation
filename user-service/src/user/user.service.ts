import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(userData: Partial<User>): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new RpcException({
        status: 409,
        message: `User with email ${userData.email} already exists`,
        error: 'Conflict',
      });
    }
    
    // Crear una copia limpia de los datos del usuario
    const user: Partial<User> = { ...userData };
    
    // Asegurarse de que role tenga un valor por defecto si no viene en los datos
    if (user.role === undefined || user.role === null) {
      user.role = 'client';
    }
    
    // Hashear la contraseña antes de guardar
    const saltRounds = 10; // Número de rondas para generar el salt
    user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);

    // Crear la instancia del usuario para aplicar valores por defecto
    const newUser = this.userRepository.create(user);
    
    // Guardar el usuario en la base de datos
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (!users || users.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No users found',
        error: 'Not Found',
      });
    }
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new RpcException({
        status: 404,
        message: `User with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new RpcException({
        status: 404,
        message: `User with email ${email} not found`,
        error: 'Not Found',
      });
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Verificar que el usuario exista
    const user = await this.findOne(id);
    
    // Si se intenta actualizar el email, verificamos que no exista otro usuario con ese email
    if (updateData.email && updateData.email !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOneBy({ email: updateData.email });
      if (existingUserWithEmail) {
        throw new RpcException({
          status: 409,
          message: `User with email ${updateData.email} already exists`,
          error: 'Conflict',
        });
      }
    }
    
    // Si se está actualizando la contraseña, hashearla
    if (updateData.passwordHash) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, saltRounds);
    }
    
    // Actualizar el usuario
    await this.userRepository.update(id, updateData);
    
    // Retornar el usuario actualizado
    return this.findOne(id);
  }
}