import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'wallet' })
export class Wallet {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column('decimal', { precision: 12, scale: 2, default: 0 }) balance: number;
}
