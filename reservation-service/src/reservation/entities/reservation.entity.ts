import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID

  @Column()
  customerId: string;

  @Column()
  roomId: string;

  @Column()
  checkInDate: Date;

  @Column()
  checkOutDate: Date;

  @Column({ type: 'float' })
  totalPrice: number;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'cancelled'] })
  status: string;

  @Column({ nullable: true })
  specialRequests: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}