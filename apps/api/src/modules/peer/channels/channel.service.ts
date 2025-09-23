import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { ChannelMemberEntity } from './channel-member.entity';

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

  async joinChannel(channelId: string, userId: string, peerId: string, displayName?: string): Promise<{ success: boolean; channel: Channel }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${channelId} not found`);

    // Remove existing membership if any
    await this.memberRepo.delete({ channelId, userId });

    const member = this.memberRepo.create({
      channelId,
      userId,
      peerId,
      displayName,
      channel: channel,
    });
    await this.memberRepo.save(member);

    const updated = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });

    this.logger.log(`User ${userId}:${displayName} joined channel ${channel.name} with peer ${peerId}`);

    return { success: true, channel: updated as unknown as Channel };
  }

  async leaveChannel(channelId: string, userId: string): Promise<{ success: boolean; channel: Channel }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${channelId} not found`);

    await this.memberRepo.delete({ channelId, userId });

    const updated = await this.channelRepo.findOne({ where: { id: channelId }, relations: ['members'] });

    this.logger.log(`User ${userId} left channel ${channel.name}`);

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

  // Helper method to get peer IDs for a channel (used by PeerService)
  async getChannelPeerIds(channelId: string): Promise<string[]> {
    const members = await this.memberRepo.find({ where: { channelId } });
    return members.map((m) => m.peerId);
  }

  // Helper method to find channels by peer ID
  async getChannelsByPeerId(peerId: string): Promise<Channel[]> {
    const members = await this.memberRepo.find({ where: { peerId } });
    const channelIds = [...new Set(members.map((m) => m.channelId))];
    if (channelIds.length === 0) return [];
    const { In } = await import('typeorm');
    const channels = await this.channelRepo.findBy({ id: In(channelIds) as any });
    return channels as unknown as Channel[];
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
    const members = await this.memberRepo.find({ where: { peerId } });
    for (const m of members) {
      await this.memberRepo.delete(m.id);
    }
  }
}
