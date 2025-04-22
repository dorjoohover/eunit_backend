import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sequences')
export class SequenceEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;
  @Column({ unique: true })
  key: string;
  @Column()
  value: number;
}
