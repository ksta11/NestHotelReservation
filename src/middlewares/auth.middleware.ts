import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { User } from '../types/user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {      // Verifica el token y lo decodifica como un objeto de tipo User
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new UnauthorizedException('JWT_SECRET is not configured');
      }
      const decoded = jwt.verify(token, jwtSecret) as User;
      req['user'] = decoded; // Agrega el usuario decodificado al objeto req
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}