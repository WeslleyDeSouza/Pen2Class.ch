import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export enum EUserTypeEntity {
  STUDENT = 1,
  TEACHER = 2
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  username!: string; // stored lowercase

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string | null;

  @Column({ type: 'smallint', default:1 })
  type!: EUserTypeEntity;

  @Column({ type: 'varchar', length: 50 })
  displayName!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
