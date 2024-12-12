import { UserEntity } from 'src/app/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { RequestEntity } from 'src/app/request/entities/request.entity';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;
  @CreateDateColumn()
  createdAt: Date;
  @Column()
  point: number;
  @Column()
  message: string;
  @Column({ default: false })
  right: boolean;
  //   huleen avagch
  @ManyToOne(() => UserEntity, (user) => user.receiverTransactions)
  receiver: UserEntity;
  //   sender
  @ManyToOne(() => UserEntity, (user) => user.remitterTransactions)
  remitter: UserEntity;
  @ManyToOne(() => RequestEntity, (request) => request.transactions, {
    nullable: true,
  })
  request: RequestEntity;
  @ManyToOne(() => PaymentEntity, (payment) => payment.transactions, {
    nullable: true,
  })
  payment: PaymentEntity;
}
