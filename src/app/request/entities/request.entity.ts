import { TransactionEntity } from 'src/app/payment/entities/transaction.entity';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { LocationEntity } from 'src/data/location/entities/location.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
@Entity('request')
export class RequestEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;
  @CreateDateColumn()
  createdAt: Date;
  @Column()
  service: number;
  @Column({ type: 'numeric' })
  area: number;
  @Column({ nullable: true })
  operation: number;
  @Column({ nullable: true })
  no: string;
  @Column({ nullable: true })
  floor: number;
  @Column({ nullable: true })
  room: number;
  @Column({ nullable: true })
  startDate: Date;
  @Column({ nullable: true })
  endDate: Date;
  @ManyToOne(() => UserEntity, (user) => user.requests)
  user: UserEntity;
  @ManyToOne(() => LocationEntity, (location) => location.request)
  location: LocationEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.request, {
    nullable: true,
  })
  transactions: TransactionEntity[];
}
