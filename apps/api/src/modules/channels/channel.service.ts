import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { ChannelMemberEntity } from './channel-member.entity';
import { JoinEvent, LeaveEvent } from '../../schemas/event-schemas';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: ChannelMember[];
  code: string;
}

export interface ChannelMember {
  userId: string;
  peerId: string;
  displayName?: string;
  joinedAt: Date;
}

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    @InjectRepository(ChannelEntity)
    private readonly channelRepo: Repository<ChannelEntity>,
    @InjectRepository(ChannelMemberEntity)
    private readonly memberRepo: Repository<ChannelMemberEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChannel(name: string, description?: string, createdBy?: string): Promise<Channel> {
    const code = await this.generateUniqueCode();
    const entity = this.channelRepo.create({
      name,
      description,
      createdBy: createdBy || 'anonymous',
      code,
    });
    const saved = await this.channelRepo.save(entity);
    this.logger.log(`Channel created: ${saved.name} (${saved.id}) with code: ${code}`);
    return { ...saved, members: [] } as unknown as Channel;
  }

  async getAllChannels(): Promise<Channel[]> {
    const channels = await this.channelRepo.find({ relations: ['members'] });
    return channels.map((c) => ({
      ...c,
      members: (c.members || []).map((m) => ({ ...m, peerId: undefined as any })),
    } as unknown as Channel));
  }

  /**
   * Returns channels where the given user has permission to access:
   * - User created the channel (createdBy === userId)
   * - User is a member of the channel (by userId)
   * Peer IDs are not exposed in the response, consistent with getAllChannels.
   */
  async getAllChannelsWithPermission(userId: string): Promise<Channel[]> {
    const channels = await this.channelRepo.find({ relations: ['members'] });
    const list = channels.filter((channel) =>
      channel.createdBy === userId || (channel.members || []).some((m) => m.userId === userId),
    );
    return list.map((channel) => ({
      ...channel,
      members: (channel.members || []).map((m) => ({ ...m, peerId: undefined as any })),
    } as unknown as Channel));
  }

  async getChannel(channelId: string): Promise<Channel> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }
    return channel as unknown as Channel;
  }

  async joinChannel(channelId: string, userId: string, displayName?: string): Promise<{ success: boolean; channel: Channel }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${channelId} not found`);

    // Remove existing membership if any
    await this.memberRepo.delete({ channelId, userId });

    const member = this.memberRepo.create({
      channelId,
      userId,
      displayName,
      channel: channel,
    });
    await this.memberRepo.save(member);

    const updated = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });

    this.logger.log(`User ${userId}:${displayName} joined channel ${channel.name} `);

    // Emit backend event for join (to be forwarded by a transport in future)
    this.eventEmitter.emit('peer.channel.message', {
      type: 'channel_message',
      channelId,
      payload: {
        event: JoinEvent.MEMBER_JOINED,
        channelId,
        userId,
        displayName,
      },
    });

    return { success: true, channel: updated as unknown as Channel };
  }

  async leaveChannel(channelId: string, userId: string): Promise<{ success: boolean; channel: Channel }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${channelId} not found`);

    await this.memberRepo.delete({ channelId, userId });

    const updated = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });

    this.logger.log(`User ${userId} left channel ${channel.name}`);

    // Emit backend event for leave
    this.eventEmitter.emit('peer.channel.message', {
      type: 'channel_message',
      channelId,
      payload: {
        event: LeaveEvent.MEMBER_LEFT,
        channelId,
        userId,
      },
    });

    return { success: true, channel: updated as unknown as Channel };
  }

  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    const members = await this.memberRepo.find({ where: { channelId } });
    return members as unknown as ChannelMember[];
  }

  async deleteChannel(channelId: string): Promise<{ success: boolean }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }

    await this.channelRepo.delete(channelId);
    this.logger.log(`Channel deleted: ${channel.name} (${channelId})`);

    return { success: true };
  }

  // Generate unique 6-digit numeric code
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      attempts++;

      const exists = await this.channelRepo.findOne({ where: { code } });
      if (!exists) break;

      if (attempts >= maxAttempts) {
        code = (Date.now() % 900000 + 100000).toString();
        break;
      }
    } while (true);

    return code;
  }

  // Find channel by code
  async getChannelByCode(code: string): Promise<Channel | null> {
    const channel = await this.channelRepo.findOne({ where: { code }, relations: ['members'] });
    return (channel as unknown as Channel) || null;
  }

  @OnEvent('peer.disconnected')
  protected async onPeerDisconnected({ peerId }: { peerId: string }) {

  }
}
