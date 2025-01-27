import { UserEntity } from 'src/app/user/entities/user.entity';
import { LocationEntity } from 'src/data/location/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service')
export class ServiceEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  name: string;
  @Column()
  code: string;

  @Column({ nullable: true })
  operation: number;
  @Column({ nullable: true })
  year: number;
  @Column({ nullable: true })
  area: number;
  @Column({ nullable: true })
  initial: number;
  @Column({ nullable: true })
  depreciation: number;
  @Column({ nullable: true })
  account: number;
  @Column({ nullable: true, type: 'float' })
  elegdel: number;
  @Column({ nullable: true, type: 'float' })
  elegdelPercent: number;
  @Column({ nullable: true, type: 'float' })
  burenOrtog: number;
  @Column({ nullable: true, type: 'float' })
  price: number;
  @Column({ nullable: true })
  date: string;
  @CreateDateColumn()
  createdAt: Date;
  @ManyToOne(() => UserEntity, (location) => location.services, {
    nullable: true,
  })
  user: UserEntity;
}
