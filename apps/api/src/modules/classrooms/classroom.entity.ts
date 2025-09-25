import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ClassroomMemberEntity } from './classroom-member.entity';

@Entity('channels')
export class ClassroomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 100 })
  createdBy!: string; // userId; keep as string for now

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @OneToMany(() => ClassroomMemberEntity, (member) => member.classroom, { cascade: true })
  members!: ClassroomMemberEntity[];
}