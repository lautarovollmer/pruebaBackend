import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ unique: true }) documento: string;
  @Column() nombres: string;
  @Column() email: string;
  @Column() celular: string;

  @CreateDateColumn() created_at: Date;
}
