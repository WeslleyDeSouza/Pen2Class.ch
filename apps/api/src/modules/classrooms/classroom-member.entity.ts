import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ClassroomEntity } from './classroom.entity';

@Entity('channel_members')
export class ClassroomMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName?: string | null;

  @CreateDateColumn({ type: 'datetime' })
  joinedAt!: Date;

  @ManyToOne(() => ClassroomEntity, (classroom) => classroom.members, { onDelete: 'CASCADE' })
  classroom!: ClassroomEntity;

  @Index()
  @Column({ type: 'uuid',  })
  classroomId!: string;
}
