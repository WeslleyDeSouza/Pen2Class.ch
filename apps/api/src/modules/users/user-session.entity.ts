import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  sessionToken!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt?: Date;
}