import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ResourceType {
  EXAM = 'EXAM',
  EDITOR = 'EDITOR',
  QUIZ = 'QUIZ',
}

@Entity('res_resources')
@Index('IDX_resource_composite', ['userId', 'type', 'classroomId', 'lessonId'], { unique: true })
export class ResourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'simple-enum', enum: ResourceType })
  type!: ResourceType;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'lessonId' })
  lessonId?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'classroomId' })
  classroomId!: string;

  @Column({ type: 'simple-json' })
  data!: Record<string, any>;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'simple-json' , nullable: true})
  configuration!: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  comments?: any[] | null;
}
