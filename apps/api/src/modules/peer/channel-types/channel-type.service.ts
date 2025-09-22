import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChannelService } from '../channels/channel.service';

export interface ChannelType {
  id: string;
  channelId: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdBy: string; // owner of the channel
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChannelTypeService {
  // store by id
  private types = new Map<string, ChannelType>();
  // index: channelId -> Set<typeId>
  private byChannel = new Map<string, Set<string>>();
  // active lessons: typeId -> Set<userId>
  private activeLessons = new Map<string, Set<string>>();

  constructor(private readonly channelService: ChannelService) {}

  list(channelId: string, requesterId?: string): ChannelType[] {
    // ensure channel exists
    const channel = this.channelService.getChannel(channelId);
    const ids = Array.from(this.byChannel.get(channelId) || []);
    const all = ids.map(id => this.types.get(id)!).filter(Boolean) as ChannelType[];
    // owner can see all, others only enabled
    if (requesterId && requesterId === channel.createdBy) return all;
    return all.filter(t => t.enabled);
  }

  get(channelId: string, typeId: string, requesterId?: string): ChannelType {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    if (!type.enabled && requesterId !== channel.createdBy) throw new ForbiddenException('Not visible');
    return type;
  }

  create(channelId: string, name: string, description: string | undefined, createdBy: string): ChannelType {
    const channel = this.channelService.getChannel(channelId);
    if (channel.createdBy !== createdBy) throw new ForbiddenException('Only owner can create channel types');
    const now = new Date();
    const type: ChannelType = {
      id: uuidv4(),
      channelId,
      name,
      description,
      enabled: true,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.types.set(type.id, type);
    if (!this.byChannel.has(channelId)) this.byChannel.set(channelId, new Set());
    this.byChannel.get(channelId)!.add(type.id);
    return type;
  }

  update(channelId: string, typeId: string, requesterId: string, patch: { name?: string; description?: string }): ChannelType {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can update channel types');
    if (typeof patch.name === 'string' && patch.name.trim()) type.name = patch.name;
    if (typeof patch.description !== 'undefined') type.description = patch.description;
    type.updatedAt = new Date();
    return type;
  }

  setEnabled(channelId: string, typeId: string, requesterId: string, enabled: boolean): ChannelType {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can enable/disable channel types');
    type.enabled = enabled;
    type.updatedAt = new Date();
    return type;
  }

  delete(channelId: string, typeId: string, requesterId: string): { success: boolean } {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can delete channel types');
    this.types.delete(typeId);
    this.byChannel.get(channelId)?.delete(typeId);
    this.activeLessons.delete(typeId);
    return { success: true };
  }

  // Lesson controls
  startLesson(channelId: string, typeId: string, userId: string) {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    if (!type.enabled) throw new ForbiddenException('Channel type is disabled');
    // must be a member of the channel
    const isMember = channel.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this channel');
    if (!this.activeLessons.has(typeId)) this.activeLessons.set(typeId, new Set());
    this.activeLessons.get(typeId)!.add(userId);
    return { success: true };
  }

  quitLesson(channelId: string, typeId: string, userId: string) {
    const channel = this.channelService.getChannel(channelId);
    const type = this.types.get(typeId);
    if (!type || type.channelId !== channelId) throw new NotFoundException('Channel type not found');
    // quitting allowed regardless of enabled state, but must have access
    const isMember = channel.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this channel');
    this.activeLessons.get(typeId)?.delete(userId);
    return { success: true };
  }

  getActiveUsers(typeId: string): string[] {
    return Array.from(this.activeLessons.get(typeId) || []);
  }
}
