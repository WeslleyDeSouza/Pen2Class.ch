import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('peer_objects')
@Index('IDX_object_composite', ['userId', 'type', 'channelId', 'channelTypeId'], { unique: true })
export class ObjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column({ type: 'simple-json' })
  data!: Record<string, any>;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  channelTypeId?: string | null;

  @Column({ type: 'varchar', length: 100 })
  channelId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'simple-json', nullable: true })
  comments?: any[] | null;
}
