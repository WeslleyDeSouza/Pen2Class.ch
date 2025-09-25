import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePeerObjectDto, UpdatePeerObjectDto, PeerObjectDto } from './object.dto';
import { ObjectEntity } from './object.entity';

export interface PeerObject extends Omit<PeerObjectDto, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ObjectService {
  private readonly logger = new Logger(ObjectService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ObjectEntity)
    private readonly objectRepo: Repository<ObjectEntity>,
  ) {}

  private toDto(obj: ObjectEntity): PeerObjectDto {
    return {
      id: obj.id,
      type: obj.type,
      data: obj.data,
      userId: obj.userId,
      channelTypeId: obj.channelTypeId ?? undefined,
      channelId: obj.channelId,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      comments: obj.comments || [],
    };
  }

  async create(dto: CreatePeerObjectDto): Promise<PeerObjectDto> {
    const entity = this.objectRepo.create({
      type: dto.type,
      data: dto.data,
      userId: dto.userId,
      channelTypeId: dto.channelTypeId ?? null,
      channelId: dto.channelId,
      comments: dto.comments ?? [],
    });

    try {
      const saved = await this.objectRepo.save(entity);
      const payload = this.toDto(saved);
      this.eventEmitter.emit('peer.object.created', payload);
      this.logger.log(`Object created ${saved.id} in channel ${saved.channelId}`);
      return payload;
    } catch (e: any) {
      // if unique constraint violated, surface conflict
      throw e;
    }
  }

  async upsert(dto: CreatePeerObjectDto): Promise<PeerObjectDto> {
    // Try find existing by composite key
    const existing = await this.objectRepo.findOne({
      where: {
        userId: dto.userId,
        type: dto.type,
        channelId: dto.channelId,
        channelTypeId: dto.channelTypeId ?? null,
      },
    });

    if (existing) {
      existing.data = dto.data;
      if (dto.comments !== undefined) existing.comments = dto.comments;
      const saved = await this.objectRepo.save(existing);
      const payload = this.toDto(saved);
      this.eventEmitter.emit('peer.object.updated', payload);
      this.logger.log(`Object upsert (updated) ${saved.id}`);
      return payload;
    }

    return this.create(dto);
  }

  async update(id: string, dto: UpdatePeerObjectDto): Promise<PeerObjectDto> {
    const existing = await this.objectRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Object ${id} not found`);

    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.data !== undefined) existing.data = dto.data;
    if (dto.comments !== undefined) existing.comments = dto.comments;

    const saved = await this.objectRepo.save(existing);
    const payload = this.toDto(saved);
    this.eventEmitter.emit('peer.object.updated', payload);
    this.logger.log(`Object updated ${id}`);
    return payload;
  }

  async delete(id: string): Promise<{ id: string; success: true }> {
    const existing = await this.objectRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Object ${id} not found`);

    await this.objectRepo.delete(id);

    this.eventEmitter.emit('peer.object.deleted', { id, channelId: existing.channelId });
    this.logger.log(`Object deleted ${id}`);
    return { id, success: true } as const;
  }

  async getByKey(parts: { userId: string; type: string; channelId: string; channelTypeId?: string | null }): Promise<PeerObjectDto> {
    const existing = await this.objectRepo.findOne({
      where: {
        userId: parts.userId,
        type: parts.type,
        channelId: parts.channelId,
        channelTypeId: parts.channelTypeId ?? null,
      },
    });
    if (!existing) {
      throw new NotFoundException(
        `Object not found for userId=${parts.userId}, type=${parts.type}, channelId=${parts.channelId}, channelTypeId=${parts.channelTypeId ?? ''}`,
      );
    }
    return this.toDto(existing);
  }

  async getById(id: string): Promise<PeerObjectDto> {
    const existing = await this.objectRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Object ${id} not found`);
    return this.toDto(existing);
  }

  async getByChannel(channelId: string): Promise<PeerObjectDto[]> {
    const list = await this.objectRepo.find({ where: { channelId } });
    return list.map((o) => this.toDto(o));
  }
}
