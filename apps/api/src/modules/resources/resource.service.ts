import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResourceDto, UpdateResourceDto, ResourceDto } from './resource.dto';
import { ResourceEntity, ResourceType } from './resource.entity';

export interface Resource extends Omit<ResourceDto, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ResourceEntity)
    private readonly objectRepo: Repository<ResourceEntity>,
  ) {}

  private toDto(obj: ResourceEntity): ResourceDto {
    return {
      id: obj.id,
      type: obj.type,
      data: obj.data,
      userId: obj.userId,
      lessonId: obj.lessonId ?? undefined,
      classroomId: obj.classroomId,
      createdAt: obj.createdAt.toISOString(),
      updatedAt: obj.updatedAt.toISOString(),
      comments: obj.comments || [],
    };
  }

  async create(dto: CreateResourceDto): Promise<ResourceDto> {
    const entity = this.objectRepo.create({
      type: dto.type,
      data: dto.data,
      userId: dto.userId,
      lessonId: dto.lessonId ?? null,
      classroomId: dto.classroomId,
      comments: dto.comments ?? [],
    });

    try {
      const saved = await this.objectRepo.save(entity);
      const payload = this.toDto(saved);
      this.eventEmitter.emit('peer.object.created', payload);
      this.logger.log(`Object created ${saved.id} in classroom ${saved.classroomId}`);
      return payload;
    } catch (e: any) {
      // if unique constraint violated, surface conflict
      throw e;
    }
  }

  async upsert(dto: CreateResourceDto): Promise<ResourceDto> {
    // Try find existing by composite key
    const existing = await this.objectRepo.findOne({
      where: {
        userId: dto.userId,
        type: dto.type,
        classroomId: dto.classroomId,
        lessonId: dto.lessonId ?? null,
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

  async update(id: string, dto: UpdateResourceDto): Promise<ResourceDto> {
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

    this.eventEmitter.emit('peer.object.deleted', { id, classroomId: existing.classroomId });
    this.logger.log(`Object deleted ${id}`);
    return { id, success: true } as const;
  }

  async getByKey(parts: { userId: string; type: string; classroomId: string; lessonId?: string | null }): Promise<ResourceDto> {
    const existing = await this.objectRepo.findOne({
      where: {
        userId: parts.userId,
        type: parts.type as ResourceType,
        classroomId: parts.classroomId,
        lessonId: parts.lessonId ?? null,
      },
    });
    if (!existing) {
      throw new NotFoundException(
        `Object not found for userId=${parts.userId}, type=${parts.type}, classroomId=${parts.classroomId}, lessonId=${parts.lessonId ?? ''}`,
      );
    }
    return this.toDto(existing);
  }

  async getById(id: string): Promise<ResourceDto> {
    const existing = await this.objectRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Object ${id} not found`);
    return this.toDto(existing);
  }

  async getByClassroom(classroomId: string): Promise<ResourceDto[]> {
    const list = await this.objectRepo.find({ where: { classroomId } });
    return list.map((o) => this.toDto(o));
  }
}