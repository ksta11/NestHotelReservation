import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from '../../hotel/entities/hotel.entity';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID

  @Column()
  roomNumber: string;

  @Column()
  roomType: string; // Cambiado de roomTypeId a roomType para guardar el tipo directamente como string

  @Column({ nullable: true })
  description: string; // Descripción del tipo de habitación
  @Column()
  capacity: number;

  @Column({ type: 'float' })
  price: number; // Precio estándar de la habitación

  @Column({ nullable: true })
  amenities: string; // Lista de comodidades separadas por comas o JSON
  
  @Column({ type: 'float', nullable: true })
  specialPrice: number; // Precio especial para fechas específicas

  @Column({ nullable: true })
  specialPriceStartDate: Date; // Fecha de inicio del precio especial

  @Column({ nullable: true })
  specialPriceEndDate: Date; // Fecha de fin del precio especial

  @Column({ 
    type: 'enum', 
    enum: ['available', 'occupied', 'maintenance', 'reserved', 'temp_reserved'], 
    default: 'available'
  })
  state: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  hotel: Hotel;
}