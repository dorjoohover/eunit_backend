import { PaymentEntity } from 'src/app/payment/entities/payment.entity';
import { TransactionEntity } from 'src/app/payment/entities/transaction.entity';
import { RequestEntity } from 'src/app/request/entities/request.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ unique: true })
  email: string;
  @Column()
  name: string;
  @Column({ nullable: true })
  firstname: string;
  @Column({ nullable: true })
  lastname: string;
  @Column({ nullable: true })
  profile: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  endDate: Date;
  @Column({ nullable: true })
  birthdate: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  password: string;
  @Column()
  role: number;
  @Column()
  wallet: number;
  @Column({ nullable: true })
  status: number;
  // status
  @Column({ nullable: true })
  phoneStatus: number;
  @Column({ nullable: true })
  emailStatus: number;
  // status
  @OneToMany(() => PaymentEntity, (payment) => payment.user, {
    nullable: true,
  })
  payments?: PaymentEntity[];
  @OneToMany(() => RequestEntity, (request) => request.user, {
    nullable: true,
  })
  requests: RequestEntity[];
  @OneToMany(() => TransactionEntity, (transaction) => transaction.receiver, {
    nullable: true,
  })
  receiverTransactions?: TransactionEntity[];
  @OneToMany(() => TransactionEntity, (transaction) => transaction.remitter, {
    nullable: true,
  })
  remitterTransactions?: TransactionEntity[];
}
