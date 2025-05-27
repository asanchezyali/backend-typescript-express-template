import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ProductCategory {
  BOOKS = 'books',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  HOME = 'home',
  SPORTS = 'sports',
}

@Entity('products')
export class Product {
  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.ELECTRONICS,
  })
  category!: ProductCategory;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('text')
  description!: string;

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
