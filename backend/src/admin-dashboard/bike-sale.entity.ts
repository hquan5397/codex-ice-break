import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Bike } from '../bikes/bike.entity';

@Entity({ name: 'bike_sales' })
export class BikeSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  bikeId: string;

  @OneToOne(() => Bike, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bikeId' })
  bike: Bike;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  saleAmount: string;

  @Column({ type: 'timestamptz' })
  soldAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
