import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePeerObjectDto, UpdatePeerObjectDto, PeerObjectDto } from './object.dto';

export interface PeerObject extends Omit<PeerObjectDto, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ObjectService {
  private readonly logger = new Logger(ObjectService.name);
  private readonly store: Map<string, PeerObject> = new Map();
  // Optional indexes for lookups
  private readonly byChannel: Map<string, Set<string>> = new Map(); // channelId -> set of objectIds

  constructor(private readonly eventEmitter: EventEmitter2) {}

  create(dto: CreatePeerObjectDto): PeerObjectDto {
    const now = new Date();
    const id = uuidv4();

    const obj: PeerObject = {
      id,
      type: dto.type,
      data: dto.data,
      userId: dto.userId,
      channelTypeId: dto.channelTypeId,
      channelId: dto.channelId,
      createdAt: now,
      updatedAt: now,
      comments: dto.comments || [],
    } as PeerObject;

    this.store.set(id, obj);
    if (!this.byChannel.has(obj.channelId)) this.byChannel.set(obj.channelId, new Set());
    this.byChannel.get(obj.channelId)!.add(id);

    const payload = this.toDto(obj);
    this.eventEmitter.emit('peer.object.created', payload);
    this.logger.log(`Object created ${id} in channel ${obj.channelId}`);
    return payload;
  }

  update(id: string, dto: UpdatePeerObjectDto): PeerObjectDto {
    const existing = this.store.get(id);
    if (!existing) throw new NotFoundException(`Object ${id} not found`);

    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.data !== undefined) existing.data = dto.data;
    if (dto.comments !== undefined) existing.comments = dto.comments;
    existing.updatedAt = new Date();

    const payload = this.toDto(existing);
    this.eventEmitter.emit('peer.object.updated', payload);
    this.logger.log(`Object updated ${id}`);
    return payload;
  }

  delete(id: string): { id: string; success: true } {
    const existing = this.store.get(id);
    if (!existing) throw new NotFoundException(`Object ${id} not found`);

    this.store.delete(id);
    const set = this.byChannel.get(existing.channelId);
    if (set) {
      set.delete(id);
      if (set.size === 0) this.byChannel.delete(existing.channelId);
    }

    this.eventEmitter.emit('peer.object.deleted', { id, channelId: existing.channelId });
    this.logger.log(`Object deleted ${id}`);
    return { id, success: true };
  }

  getById(id: string): PeerObjectDto {
    const existing = this.store.get(id);
    if (!existing) throw new NotFoundException(`Object ${id} not found`);
    return this.toDto(existing);
  }

  getByChannel(channelId: string): PeerObjectDto[] {
    const ids = this.byChannel.get(channelId);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.toDto(this.store.get(id)!));
  }

  private toDto(obj: PeerObject): PeerObjectDto {
    return {
      id: obj.id,
      type: obj.type,
      data: obj.data,
      userId: obj.userId,
      channelTypeId: obj.channelTypeId,
      channelId: obj.channelId,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      comments: obj.comments || [],
    };
  }
}
