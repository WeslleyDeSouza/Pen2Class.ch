import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LessonEntity } from './lesson.entity';

/*
* Todo find use case for this Entity
*  channel_type_metas ?
* */

@Entity('channel_type_lessons')
@Index(['lessonId', 'userId'], { unique: true })
export class LessonTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK to lessons (formerly channel_types)
  @Column({ type: 'uuid', name: 'lessonId' })
  lessonId!: string;

  @ManyToOne(() => LessonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson?: LessonEntity;

  // FK to classrooms (formerly channels)
  @Index()
  @Column({ type: 'uuid', name: 'channelId' })
  classroomId!: string;

  @ManyToOne('ClassroomEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  classroom?: any;

  // user who started the lesson (kept as string ID for now)
  @Column({ type: 'varchar', length: 128 })
  userId!: string;

  @CreateDateColumn({ type: 'datetime' })
  startedAt!: Date;

  @CreateDateColumn({ type: 'datetime' })
  completedAt!: Date;
}
