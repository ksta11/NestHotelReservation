import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class MicroserviceExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // DEPURACIÓN: Mostrar el error recibido del microservicio
        console.log('Error recibido del microservicio:', JSON.stringify(error, null, 2));
        // Normalizar error recibido del microservicio
        let status = error?.status || error?.statusCode;
        let message = error?.message;
        let errorType = error?.error;

        // Si viene anidado en response
        if (error?.response) {
          status = error.response.status || error.response.statusCode || status;
          message = error.response.message || message;
          errorType = error.response.error || errorType;
        }

        // Si el mensaje es un array, lo convertimos a string
        if (Array.isArray(message)) {
          message = message.join(', ');
        }

        // Lanzar la excepción HTTP adecuada
        switch (status) {
          case 400:
            return throwError(() => new BadRequestException(message));
          case 401:
            return throwError(() => new UnauthorizedException(message));
          case 404:
            return throwError(() => new NotFoundException(message));
          case 409:
            return throwError(() => new ConflictException(message));
          default:
            return throwError(() => new InternalServerErrorException(message || 'An unexpected error occurred'));
        }
      }),
    );
  }
}