import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChannelService } from '../channels/channel.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelTypeEntity } from './channel-type.entity';
import { ChannelTypeLessonEntity } from './channel-type-lesson.entity';

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
  constructor(
    private readonly channelService: ChannelService,
    @InjectRepository(ChannelTypeEntity)
    private readonly typeRepo: Repository<ChannelTypeEntity>,
    @InjectRepository(ChannelTypeLessonEntity)
    private readonly lessonRepo: Repository<ChannelTypeLessonEntity>,
  ) {}

  async list(channelId: string, requesterId?: string): Promise<ChannelType[]> {
    // ensure channel exists
    const channel = await this.channelService.getChannel(channelId);
    const all = await this.typeRepo.find({ where: { channelId } });
    if (requesterId && requesterId === channel.createdBy) return all as unknown as ChannelType[];
    return (all as unknown as ChannelType[]).filter(t => t.enabled);
  }

  async get(channelId: string, typeId: string, requesterId?: string): Promise<ChannelType> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    if (!type.enabled && requesterId !== channel.createdBy) throw new ForbiddenException('Not visible');
    return type as unknown as ChannelType;
  }

  async create(channelId: string, name: string, description: string | undefined, createdBy: string): Promise<ChannelType> {
    const channel = await this.channelService.getChannel(channelId);
    if (channel.createdBy !== createdBy) {
      throw new ForbiddenException('Only owner can create channel types');
    }
    const entity = this.typeRepo.create({
      channelId,
      name,
      description: description ?? null,
      enabled: true,
      createdBy,
    });
    const saved = await this.typeRepo.save(entity);
    return saved as unknown as ChannelType;
  }

  async update(
    channelId: string,
    typeId: string,
    requesterId: string,
    patch: { name?: string; description?: string },
  ): Promise<ChannelType> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can update channel types');
    if (typeof patch.name === 'string' && patch.name.trim()) type.name = patch.name;
    if (typeof patch.description !== 'undefined') type.description = patch.description ?? null;
    const saved = await this.typeRepo.save(type);
    return saved as unknown as ChannelType;
  }

  async setEnabled(channelId: string, typeId: string, requesterId: string, enabled: boolean): Promise<ChannelType> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can enable/disable channel types');
    type.enabled = enabled;
    const saved = await this.typeRepo.save(type);
    return saved as unknown as ChannelType;
  }

  async delete(channelId: string, typeId: string, requesterId: string): Promise<{ success: boolean }> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    if (channel.createdBy !== requesterId) throw new ForbiddenException('Only owner can delete channel types');
    // Remove active lessons for this type first (if any)
    await this.lessonRepo.delete({ channelTypeId: typeId });
    await this.typeRepo.delete(typeId);
    return { success: true };
  }

  // Lesson controls
  async startLesson(channelId: string, typeId: string, userId: string): Promise<{ success: true }> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    if (!type.enabled) throw new ForbiddenException('Channel type is disabled');
    // must be a member of the channel
    const isMember = channel.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this channel');

    // idempotent create
    const existing = await this.lessonRepo.findOne({ where: { channelTypeId: typeId, userId } });
    if (!existing) {
      const lesson = this.lessonRepo.create({ channelTypeId: typeId, userId, channelId });
      await this.lessonRepo.save(lesson);
    }

    return { success: true } as const;
  }

  async quitLesson(channelId: string, typeId: string, userId: string): Promise<{ success: true }> {
    const channel = await this.channelService.getChannel(channelId);
    const type = await this.typeRepo.findOne({ where: { id: typeId, channelId } });
    if (!type) throw new NotFoundException('Channel type not found');
    // quitting allowed regardless of enabled state, but must have access
    const isMember = channel.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this channel');

    await this.lessonRepo.delete({ channelTypeId: typeId, userId });
    return { success: true } as const;
  }

  async getActiveUsers(typeId: string): Promise<string[]> {
    const rows = await this.lessonRepo.find({ where: { channelTypeId: typeId } });
    return rows.map(r => r.userId);
  }
}
