import { Injectable, ConflictException } from '@nestjs/common';
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

  async create(user: Partial<User>): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.userRepository.findOneBy({ email: user.email });
    if (existingUser) {
      throw new ConflictException(`User with email ${user.email} already exists`);
    }

    // Hashear la contraseña antes de guardar
    const saltRounds = 10; // Número de rondas para generar el salt
    user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);

    // Guardar el usuario si no existe
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ email });
    return user || undefined;
  }
}