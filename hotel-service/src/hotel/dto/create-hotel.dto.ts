export class CreateHotelDto {
    name: string; // Nombre del hotel
    address: string; // Dirección del hotel
    description?: string; // Descripción del hotel (opcional)
    rating?: number; // Calificación promedio del hotel (opcional, por defecto 0)
  }