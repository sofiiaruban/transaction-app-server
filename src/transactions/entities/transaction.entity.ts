import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn({ name: 'TransactionId' })
  id: number;

  @Column()
  Status: string;

  @Column()
  Type: string;

  @Column()
  ClientName: string;

  @Column()
  Amount: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
