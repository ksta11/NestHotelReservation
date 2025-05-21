import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID

  @Column()
  userId: string; // Usuario que hace la reserva (anteriormente customerId)

  @Column()
  hotelId: string; // ID del hotel para facilitar consultas

  @Column()
  roomId: string;

  @Column()
  checkInDate: Date;

  @Column()
  checkOutDate: Date;
  @Column({ type: 'float' })
  totalPrice: number;
  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'] })
  status: string;

  @Column({ nullable: true, type: 'text' })
  specialRequests: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'refunded', 'cancelled'], default: 'pending' })
  paymentStatus: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}