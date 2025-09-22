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
  // Composite index: userId + type + channelId + channelTypeId -> objectId
  private readonly byComposite: Map<string, string> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  private makeKey(parts: { userId: string; type: string; channelId: string; channelTypeId?: string | null }): string {
    const channelTypeId = parts.channelTypeId ?? '';
    return `${parts.userId}::${parts.type}::${parts.channelId}::${channelTypeId}`;
  }

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
    // index by composite key
    this.byComposite.set(this.makeKey(obj), id);

    const payload = this.toDto(obj);
    this.eventEmitter.emit('peer.object.created', payload);
    this.logger.log(`Object created ${id} in channel ${obj.channelId}`);
    return payload;
  }

  upsert(dto: CreatePeerObjectDto): PeerObjectDto {
    const key = this.makeKey({
      userId: dto.userId,
      type: dto.type,
      channelId: dto.channelId,
      channelTypeId: dto.channelTypeId,
    });
    const existingId = this.byComposite.get(key);
    if (existingId) {
      // update existing object's data/comments and timestamp
      const existing = this.store.get(existingId)!;
      existing.data = dto.data;
      if (dto.comments !== undefined) existing.comments = dto.comments;
      existing.updatedAt = new Date();

      const payload = this.toDto(existing);
      this.eventEmitter.emit('peer.object.updated', payload);
      this.logger.log(`Object upsert (updated) ${existingId}`);
      return payload;
    }
    // not found, create new
    return this.create(dto);
  }

  update(id: string, dto: UpdatePeerObjectDto): PeerObjectDto {
    const existing = this.store.get(id);
    if (!existing) throw new NotFoundException(`Object ${id} not found`);

    // Handle potential change to type (affects composite index)
    if (dto.type !== undefined && dto.type !== existing.type) {
      const oldKey = this.makeKey(existing);
      this.byComposite.delete(oldKey);
      const newKey = this.makeKey({
        userId: existing.userId,
        type: dto.type,
        channelId: existing.channelId,
        channelTypeId: existing.channelTypeId,
      });
      this.byComposite.set(newKey, id);
      existing.type = dto.type;
    }
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
    // remove composite index
    this.byComposite.delete(this.makeKey(existing));

    this.eventEmitter.emit('peer.object.deleted', { id, channelId: existing.channelId });
    this.logger.log(`Object deleted ${id}`);
    return { id, success: true };
  }

  getByKey(parts: { userId: string; type: string; channelId: string; channelTypeId?: string | null }): PeerObjectDto {
    const key = this.makeKey(parts);
    const id = this.byComposite.get(key);
    if (!id) {
      throw new NotFoundException(
        `Object not found for userId=${parts.userId}, type=${parts.type}, channelId=${parts.channelId}, channelTypeId=${parts.channelTypeId ?? ''}`,
      );
    }
    const existing = this.store.get(id)!;
    return this.toDto(existing);
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
