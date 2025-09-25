import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelTypeEntity } from './channel-type.entity';
import { ChannelEntity } from '../channels/channel.entity';

/*
* Todo find use case for this Entity
*  channel_type_metas ?
* */

@Entity('channel_type_lessons')
@Index(['channelTypeId', 'userId'], { unique: true })
export class ChannelTypeLessonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK to channel_types
  @Column({ type: 'uuid' })
  channelTypeId!: string;

  @ManyToOne(() => ChannelTypeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelTypeId' })
  channelType?: ChannelTypeEntity;

  // FK to channels
  @Index()
  @Column({ type: 'uuid' })
  channelId!: string;

  @ManyToOne(() => ChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel?: ChannelEntity;

  // user who started the lesson (kept as string ID for now)
  @Column({ type: 'varchar', length: 128 })
  userId!: string;

  @CreateDateColumn({ type: 'datetime' })
  startedAt!: Date;

  @CreateDateColumn({ type: 'datetime' })
  completedAt!: Date;
}
