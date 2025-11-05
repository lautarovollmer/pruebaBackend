import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'payment_session' })
export class PaymentSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: number;
  @Column('decimal', { precision: 12, scale: 2 }) amount: number;
  @Column() token: string;
  @Column() status: string; // PENDING, CONFIRMED, EXPIRED
  @Column({ type: 'datetime' }) expires_at: Date;
  @CreateDateColumn() created_at: Date;
}
