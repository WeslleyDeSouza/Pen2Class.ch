import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChannelEntity } from '../channels/channel.entity';

@Entity('channel_types')
export class ChannelTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'varchar', length: 100 })
  createdBy!: string; // owner of the channel

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 36 })
  channelId!: string;

  @ManyToOne(() => ChannelEntity, (channel) => channel.id, { onDelete: 'CASCADE' })
  channel?: ChannelEntity;
}
