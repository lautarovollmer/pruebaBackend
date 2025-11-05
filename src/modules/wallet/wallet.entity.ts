import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('wallet')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;
}
