import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BikeBrand } from './bike-brand.enum';

@Entity({ name: 'bikes' })
export class Bike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  title: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  brand?: BikeBrand | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  model?: string | null;

  @Column({ type: 'int', nullable: true })
  year?: number | null;

  @Column({ type: 'int', nullable: true })
  mileage?: number | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column()
  imageUrl: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  imageUrls: string[];

  @Column({ default: false })
  sold: boolean;

  @Column({ default: false })
  pinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterLoad()
  hydrateImageUrls() {
    if (!this.imageUrls?.length && this.imageUrl) {
      this.imageUrls = [this.imageUrl];
    }
  }
}
