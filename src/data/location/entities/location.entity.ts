import { RequestEntity } from 'src/app/request/entities/request.entity';
import { AdEntity } from 'src/data/ad/entities/ad.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ type: 'float', nullable: true })
  lat: number;
  @Column({ type: 'float', nullable: true })
  lng: number;

  @Column({ type: 'varchar', length: 40 })
  district: string;
  //   eronhii nershil
  @Column({ type: 'varchar', length: 100 })
  name: string;
  //   , split hiij harna
  @Column({ type: 'varchar', length: 100, nullable: true })
  town: string;
  @Column({ type: 'varchar', length: 100, nullable: true })
  englishNameOfTown: string;
  //   horooo
  @Column({ type: 'int', nullable: true })
  khoroo: number;
  @Column({ type: 'varchar', length: 100 })
  city: string;

  //   imap iin eronhii nershil
  // @Column({ nullable: true })
  // street: string;
  @Column({ type: 'int', nullable: true })
  zipcode: number;
  // @Column({ nullable: true })
  // no: string;
  @OneToMany(() => AdEntity, (ad) => ad.location)
  ads: AdEntity[];
  @OneToMany(() => RequestEntity, (request) => request.location)
  request: RequestEntity[];

  @Column({ nullable: true })
  operation: string;
  // @Column({ type: 'int', nullable: true })
  // committee: number;
  @Column({ nullable: true })
  operationOrNot: boolean;
}
