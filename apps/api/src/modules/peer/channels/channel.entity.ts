import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ChannelMemberEntity } from './channel-member.entity';

@Entity('channels')
export class ChannelEntity {
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

  @OneToMany(() => ChannelMemberEntity, (member) => member.channel, { cascade: true })
  members!: ChannelMemberEntity[];
}
