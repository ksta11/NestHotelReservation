import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MicroserviceExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Verificar si el error proviene de un microservicio
        if (error.response && error.status) {
          const { status, response } = error;

          // Extraer detalles del error
          const message = response?.message || 'An error occurred';
          const errorType = response?.error || 'Error';

          // Manejar errores específicos según el código de estado
          switch (status) {
            case 400:
              return throwError(() => new BadRequestException(message));
            case 404:
              return throwError(() => new NotFoundException(message));
            case 409:
              return throwError(() => new ConflictException(message));
            default:
              return throwError(() => new InternalServerErrorException(message));
          }
        }

        // Manejar errores inesperados
        return throwError(() => new InternalServerErrorException('An unexpected error occurred'));
      }),
    );
  }
}