import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {OnEvent} from "@nestjs/event-emitter";

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
  private channels: Map<string, Channel> = new Map();

  createChannel(name: string, description?: string, createdBy?: string): Channel {
    const code = this.generateUniqueCode();
    const channel: Channel = {
      id: uuidv4(),
      name,
      description,
      createdBy: createdBy || 'anonymous',
      createdAt: new Date(),
      members: [],
      code
    };

    this.channels.set(channel.id, channel);
    this.logger.log(`Channel created: ${channel.name} (${channel.id}) with code: ${code}`);

    return channel;
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values()).map(channel => ({
      ...channel,
      members: channel.members.map(m => ({ ...m, peerId: undefined })) // Don't expose peerIds in list
    }));
  }

  /**
   * Returns channels where the given user has permission to access:
   * - User created the channel (createdBy === userId)
   * - User is a member of the channel (by userId)
   * Peer IDs are not exposed in the response, consistent with getAllChannels.
   */
  getAllChannelsWithPermission(userId: string): Channel[] {
    const list = Array.from(this.channels.values()).filter(channel =>
      channel.createdBy === userId || channel.members.some(m => m.userId === userId)
    );

    return list.map(channel => ({
      ...channel,
      members: channel.members.map(m => ({ ...m, peerId: undefined }))
    }));
  }

  getChannel(channelId: string): Channel {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }
    return channel;
  }

  joinChannel(channelId: string, userId: string, peerId: string, displayName?:string): { success: boolean; channel: Channel } {
    const channel = this.getChannel(channelId);

    // Remove existing membership if any
    channel.members = channel.members.filter(m => m.userId !== userId);

    // Add new membership
    channel.members.push({
      userId,
      peerId,
      displayName,
      joinedAt: new Date()
    });

    this.logger.log(`User ${userId}:${displayName} joined channel ${channel.name} with peer ${peerId}`);

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

  // Generate unique 6-digit numeric code
  private generateUniqueCode(): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      // Generate 6-digit code
      code = Math.floor(100000 + Math.random() * 900000).toString();
      attempts++;

      if (attempts >= maxAttempts) {
        // Fallback: use timestamp-based code if too many collisions
        code = (Date.now() % 900000 + 100000).toString();
        break;
      }
    } while (this.isCodeExists(code));

    return code;
  }

  // Check if code already exists
  private isCodeExists(code: string): boolean {
    return Array.from(this.channels.values()).some(channel => channel.code === code);
  }

  // Find channel by code
  getChannelByCode(code: string): Channel | null {
    return Array.from(this.channels.values()).find(channel => channel.code === code) || null;
  }

  @OnEvent('peer.disconnected')
  protected onPeerDisconnected({ peerId}: { peerId: string }){
    // Remove from all channels that this peer was connected to
    const userChannels = this.getChannelsByPeerId(peerId);
    userChannels.forEach(channel => {
      // Find the member with this peerId and remove them
      channel.members = channel.members.filter(member => member.peerId !== peerId);
    });
  }
}
