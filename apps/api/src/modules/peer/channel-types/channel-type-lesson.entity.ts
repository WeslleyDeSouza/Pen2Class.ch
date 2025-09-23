import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channel_type_lessons')
@Index(['channelTypeId', 'userId'], { unique: true })
export class ChannelTypeLessonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  channelTypeId!: string;

  @Column({ type: 'varchar', length: 64 })
  channelId!: string;

  @Column({ type: 'varchar', length: 128 })
  userId!: string;

  @CreateDateColumn({ type: 'datetime' })
  startedAt!: Date;
}
