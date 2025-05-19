import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hotelId: string; // Identificador del hotel

  @Column()
  userId: string; // Identificador del usuario (anteriormente customerId)

  @Column()
  reservationId: string; // Identificador de la reserva

  @Column()
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ default: true })
  isVisible: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}