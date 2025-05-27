import * as bcrypt from 'bcryptjs';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

@Entity('users')
export class User {
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  lastName!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  refreshToken!: string;

  @Column({ nullable: true })
  resetPasswordExpires!: Date;

  @Column({ nullable: true })
  resetPasswordToken!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @UpdateDateColumn()
  updatedAt!: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  toJSON() {
    const { password, resetPasswordToken, resetPasswordExpires, refreshToken, ...userWithoutSensitiveInfo } = this;
    return userWithoutSensitiveInfo;
  }
}
