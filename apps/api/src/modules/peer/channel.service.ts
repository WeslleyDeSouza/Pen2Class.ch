import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: ChannelMember[];
}

export interface ChannelMember {
  userId: string;
  peerId: string;
  joinedAt: Date;
}

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private channels: Map<string, Channel> = new Map();

  createChannel(name: string, description?: string, createdBy?: string): Channel {
    const channel: Channel = {
      id: uuidv4(),
      name,
      description,
      createdBy: createdBy || 'anonymous',
      createdAt: new Date(),
      members: []
    };

    this.channels.set(channel.id, channel);
    this.logger.log(`Channel created: ${channel.name} (${channel.id})`);

    return channel;
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values()).map(channel => ({
      ...channel,
      members: channel.members.map(m => ({ ...m, peerId: undefined })) // Don't expose peerIds in list
    }));
  }

  getChannel(channelId: string): Channel {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }
    return channel;
  }

  joinChannel(channelId: string, userId: string, peerId: string): { success: boolean; channel: Channel } {
    const channel = this.getChannel(channelId);

    // Remove existing membership if any
    channel.members = channel.members.filter(m => m.userId !== userId);

    // Add new membership
    channel.members.push({
      userId,
      peerId,
      joinedAt: new Date()
    });

    this.logger.log(`User ${userId} joined channel ${channel.name} with peer ${peerId}`);

    return { success: true, channel };
  }

  leaveChannel(channelId: string, userId: string): { success: boolean; channel: Channel } {
    const channel = this.getChannel(channelId);
    const initialLength = channel.members.length;

    channel.members = channel.members.filter(m => m.userId !== userId);

    if (channel.members.length < initialLength) {
      this.logger.log(`User ${userId} left channel ${channel.name}`);
    }

    return { success: true, channel };
  }

  getChannelMembers(channelId: string): ChannelMember[] {
    const channel = this.getChannel(channelId);
    return channel.members;
  }

  deleteChannel(channelId: string): { success: boolean } {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }

    this.channels.delete(channelId);
    this.logger.log(`Channel deleted: ${channel.name} (${channelId})`);

    return { success: true };
  }

  // Helper method to get peer IDs for a channel (used by PeerService)
  getChannelPeerIds(channelId: string): string[] {
    const channel = this.channels.get(channelId);
    return channel ? channel.members.map(m => m.peerId) : [];
  }

  // Helper method to find channels by peer ID
  getChannelsByPeerId(peerId: string): Channel[] {
    return Array.from(this.channels.values()).filter(channel =>
      channel.members.some(member => member.peerId === peerId)
    );
  }
}