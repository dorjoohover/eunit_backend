import { UserEntity } from 'src/app/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { RequestEntity } from 'src/app/request/entities/request.entity';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ unique: true })
  email: string;
  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  point: number;
  @Column()
  money: number;

  @ManyToOne(() => UserEntity, (user) => user.payments)
  user: UserEntity;
  @ManyToOne(() => RequestEntity, (request) => request.transactions)
  request: RequestEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.request, {
    nullable: true,
  })
  transactions: TransactionEntity[];
}
