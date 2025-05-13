import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Hotel } from '../../hotel/entities/hotel.entity';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID

  @Column()
  roomNumber: string;

  @Column()
  roomTypeId: string;

  @Column({ type: 'float' })
  price: number;

  @Column()
  capacity: number;

  @Column({ default: true })
  isActive: boolean; // Cambiado de "isAvailable" a "isActive"

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  hotel: Hotel;
}