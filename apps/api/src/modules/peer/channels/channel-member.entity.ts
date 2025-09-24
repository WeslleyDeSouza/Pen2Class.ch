import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ChannelEntity } from './channel.entity';

@Entity('channel_members')
export class ChannelMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName?: string | null;

  @CreateDateColumn({ type: 'datetime' })
  joinedAt!: Date;

  @ManyToOne(() => ChannelEntity, (channel) => channel.members, { onDelete: 'CASCADE' })
  channel!: ChannelEntity;

  @Index()
  @Column({ type: 'uuid' })
  channelId!: string;
}
