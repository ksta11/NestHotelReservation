export class CreateHotelDto {
    name: string; // Nombre del hotel
    address: string; // Dirección del hotel
    description?: string; // Descripción del hotel (opcional)
    city: string; // Ciudad
    country: string; // País
    postalCode: string; // Código postal
    phone: string; // Número de teléfono
    email: string; // Correo electrónico
    averageRating?: number; // Calificación promedio del hotel (opcional, por defecto 0)
    checkInTime?: string; // Hora de check-in (formato HH:MM)
    checkOutTime?: string; // Hora de check-out (formato HH:MM)
    cancellationPolicy?: string; // Política de cancelación
    userId: string; // ID del usuario que administrará el hotel
  }