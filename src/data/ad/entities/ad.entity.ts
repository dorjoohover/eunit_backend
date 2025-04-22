import { LocationEntity } from 'src/data/location/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ad')
export class AdEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  title: string;

  @ManyToOne(() => LocationEntity, (location) => location.ads, {
    nullable: true,
  })
  location: LocationEntity;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'float' })
  area: number;

  @Column({ type: 'numeric' })
  price: number;
  @Column({ type: 'numeric' })
  unitPrice: number;
  @Column({ nullable: true })
  operation: number;
  @Column()
  uneguiId: string;

  @Column({ nullable: true })
  paymentMethod: string;
  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  buildingProcess: string;

  @Column({ nullable: true })
  floor: string;
  @Column({ nullable: true })
  room: number;

  @Column({ nullable: true })
  door: string;

  @Column({ nullable: true })
  balconyUnit: string;

  @Column({ nullable: true })
  howFloor: number;

  @Column({ nullable: true })
  buildingFloor: number;

  @Column({ nullable: true })
  windowUnit: string;

  @Column({ nullable: true })
  garage: string;

  @Column({ nullable: true })
  window: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  landUsage: string;
}
