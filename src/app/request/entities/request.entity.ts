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

  @Column({ nullable: true })
  category: number;
  @Column({ nullable: true })
  status: number;
  @Column({ nullable: true })
  startDate: Date;
  @Column({ nullable: true })
  endDate: Date;
  @Column({ nullable: true })
  payment: number;
  @Column({ nullable: true })
  code: string;
  @Column({ nullable: true })
  lastname: string;
  @Column({ nullable: true })
  firstname: string;
  @Column({ nullable: true })
  org: string;
  @Column({ nullable: true })
  usage: number;

  // realstate
  @Column({ nullable: true })
  no: string;
  @Column({ type: 'numeric', nullable: true })
  area: number;
  @Column({ nullable: true })
  operation: number;
  @Column({ nullable: true })
  floor: number;
  @Column({ nullable: true })
  room: number;

  // cars
  @Column({ nullable: true })
  brand: string;
  @Column({ nullable: true })
  mark: string;
  @Column({ nullable: true })
  capacity: string;
  @Column({ nullable: true })
  manufacture: number;
  @Column({ nullable: true })
  entry: number;
  @Column({ nullable: true })
  gearbox: string;
  @Column({ nullable: true })
  hurd: string;
  // @Column({ nullable: true })
  // type: string;
  @Column({ nullable: true })
  color: string;
  @Column({ nullable: true })
  engine: string;
  @Column({ nullable: true })
  interior: string;
  @Column({ nullable: true })
  drive: string;
  @Column({ nullable: true })
  mileage: number;
  @Column({ nullable: true })
  conditions: string;
  @Column({ nullable: true, type: 'numeric' })
  result?: number;
  @Column({ nullable: true, type: 'numeric' })
  min?: number;
  @Column({ nullable: true, type: 'numeric' })
  max?: number;
  @ManyToOne(() => UserEntity, (user) => user.requests, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
  @ManyToOne(() => LocationEntity, (location) => location.request, {
    nullable: true,
  })
  location: LocationEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.request, {
    nullable: true,
  })
  transactions: TransactionEntity[];
}
