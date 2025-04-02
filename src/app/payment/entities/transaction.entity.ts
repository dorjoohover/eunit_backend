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
  @Column({ nullable: true })
  point: number;
  @Column({ nullable: true })
  message: string;
  @Column({ default: false, nullable: true })
  right: boolean;
  @Column({ nullable: true })
  paymentType: number;
  //   huleen avagch
  @ManyToOne(() => UserEntity, (user) => user.users, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  user: UserEntity;
  @ManyToOne(() => RequestEntity, (request) => request.transactions, {
    nullable: true,
    eager: true,
  })
  request: RequestEntity;
  @ManyToOne(() => PaymentEntity, (payment) => payment.transactions, {
    nullable: true,
  })
  payment: PaymentEntity;
}
