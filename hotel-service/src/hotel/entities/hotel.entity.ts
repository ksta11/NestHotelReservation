import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Room } from '../../room/entities/room.entity'; // Importa la entidad Room

@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column()
  phone: string;

  @Column()
  email: string;
  
  @Column({ type: 'float', default: 0 })
  averageRating: number; // Cambiado de "rating" a "averageRating"
  
  @Column({ type: 'time', nullable: true })
  checkInTime: string; // Hora de check-in (formato HH:MM)

  @Column({ type: 'time', nullable: true })
  checkOutTime: string; // Hora de check-out (formato HH:MM)

  @Column({ nullable: true })
  cancellationPolicy: string; // Política de cancelación

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Room, (room) => room.hotel, { cascade: true })
  rooms: Room[];
}