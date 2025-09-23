import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  username!: string; // stored lowercase

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 50 })
  displayName!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
