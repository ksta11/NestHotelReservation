import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User } from '../types/user.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy, // Inyecta el cliente de microservicio
  ) {}
  // Registro de usuario
  async register(userData: any) {
    try {
      // Enviar mensaje al microservicio de usuarios para crear un usuario
      const user = await firstValueFrom(
        this.userClient.send({ cmd: 'create-user' }, userData)
      );
      return this.generateToken(user);
    } catch (error) {
      console.error('Error en registro:', error);
      throw new UnauthorizedException('Error during registration');
    }
  }

  // Login de usuario
  async login(email: string, password: string) {
    console.log('Intentando login con email:', email);
    // Enviar mensaje al microservicio de usuarios para buscar el usuario por email
    let user: User;
    try {
      user = await firstValueFrom(
        this.userClient.send({ cmd: 'get-user-by-email' }, { email })
      );
      console.log('Usuario encontrado:', user ? 'true' : 'false');
    } catch (err) {
      console.error('Error al buscar usuario:', err);
      // Si el microservicio responde con error, propágalo como UnauthorizedException de Nest
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }
  // Generar token JWT
  private generateToken(user: User) {
    const payload = { 
      sub: user.id, // Using 'sub' as standard JWT claim for subject ID
      email: user.email, 
      role: user.role 
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
