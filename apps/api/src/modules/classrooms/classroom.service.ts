import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomEntity } from './classroom.entity';
import { ClassroomMemberEntity } from './classroom-member.entity';

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: ClassroomMember[];
  code: string;
}

export interface ClassroomMember {
  userId: string;
  peerId: string;
  displayName?: string;
  joinedAt: Date;
}

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger(ClassroomService.name);

  constructor(
    @InjectRepository(ClassroomEntity)
    private readonly classroomRepo: Repository<ClassroomEntity>,
    @InjectRepository(ClassroomMemberEntity)
    private readonly memberRepo: Repository<ClassroomMemberEntity>,
  ) {}

  async createClassroom(name: string, description?: string, createdBy?: string): Promise<Classroom> {
    const code = await this.generateUniqueCode();
    const entity = this.classroomRepo.create({
      name,
      description,
      createdBy: createdBy || 'anonymous',
      code,
    });
    const saved = await this.classroomRepo.save(entity);
    this.logger.log(`Channel created: ${saved.name} (${saved.id}) with code: ${code}`);
    return { ...saved, members: [] } as unknown as Classroom;
  }

  async getAllClassrooms(): Promise<Classroom[]> {
    const channels = await this.classroomRepo.find({ relations: ['members'] });
    return channels.map((c) => ({
      ...c,
      members: (c.members || []).map((m) => ({ ...m, peerId: undefined as any })),
    } as unknown as Classroom));
  }

  /**
   * Returns channels where the given user has permission to access:
   * - User created the channel (createdBy === userId)
   * - User is a member of the channel (by userId)
   * Peer IDs are not exposed in the response, consistent with getAllChannels.
   */
  async getAllClassroomsByUser(userId: string): Promise<Classroom[]> {
    const channels = await this.classroomRepo.find({ relations: ['members'] });
    const list = channels.filter((channel) =>
      channel.createdBy === userId || (channel.members || []).some((m) => m.userId === userId),
    );
    return list.map((channel) => ({
      ...channel,
      members: (channel.members || []).map((m) => ({ ...m, peerId: undefined as any })),
    } as unknown as Classroom));
  }

  async getClassroom(classroomId: string): Promise<Classroom> {
    const channel = await this.classroomRepo.findOne({ where: { id: classroomId }, relations: ['members'] });
    if (!channel) {
      throw new NotFoundException(`Channel ${classroomId} not found`);
    }
    return channel as unknown as Classroom;
  }

  async joinClassroomByCode(code: string, userId: string, displayName?: string): Promise<{ success: boolean; classroom: Classroom }> {
    const channel = await this.classroomRepo.findOne({ where: { code: code }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${code} not found`);

    // lookup existing member or create new by channel.id and userId (idempotent join)
    let member = await this.memberRepo.findOne({ where: { classroomId: channel.id, userId } });

    if (member) {
      // Optionally update displayName if a new one is provided
      if (typeof displayName === 'string' && displayName.length > 0 && member.displayName !== displayName) {
        member.displayName = displayName;
        await this.memberRepo.save(member);
      }
      this.logger.log(`User ${userId}:${displayName ?? member.displayName ?? ''} is already a member of channel ${channel.name}`);
    } else {
      member = this.memberRepo.create({
        classroomId: channel.id,
        userId,
        displayName,
        classroom: channel,
      });
      await this.memberRepo.save(member);
      this.logger.log(`User ${userId}:${displayName ?? ''} joined channel ${channel.name}`);
    }

    const updated = await this.classroomRepo.findOne({ where: { id: channel.id }, relations: ['members'] });

    return { success: true, classroom: updated as unknown as Classroom };
  }

  async leaveClassroom(classroomId: string, userId: string): Promise<{ success: boolean; classroom: Classroom }> {
    const channel = await this.classroomRepo.findOne({ where: { id: classroomId }, relations: ['members'] });
    if (!channel) throw new NotFoundException(`Channel ${classroomId} not found`);

    await this.memberRepo.delete({ classroomId: classroomId, userId });

    const updated = await this.classroomRepo.findOne({ where: { id: classroomId }, relations: ['members'] });

    this.logger.log(`User ${userId} left channel ${channel.name}`);

    return { success: true, classroom: updated as unknown as Classroom };
  }

  async getClassroomMembers(classroomId: string): Promise<ClassroomMember[]> {
    const members = await this.memberRepo.find({ where: { classroomId: classroomId } });
    return members as unknown as ClassroomMember[];
  }

  async deleteClassroom(classroomId: string): Promise<{ success: boolean }> {
    const channel = await this.classroomRepo.findOne({ where: { id: classroomId } });
    if (!channel) {
      throw new NotFoundException(`Channel ${classroomId} not found`);
    }

    await this.classroomRepo.delete(classroomId);
    this.logger.log(`Channel deleted: ${channel.name} (${classroomId})`);

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

      const exists = await this.classroomRepo.findOne({ where: { code } });
      if (!exists) break;

      if (attempts >= maxAttempts) {
        code = (Date.now() % 900000 + 100000).toString();
        break;
      }
    } while (true);

    return code;
  }

  // Find classroom by code
  async getClassroomByCode(code: string): Promise<Classroom | null> {
    const channel = await this.classroomRepo.findOne({ where: { code }, relations: ['members'] });
    return (channel as unknown as Classroom) || null;
  }

  async updateClassroom(
    id: string,
    name?: string,
    description?: string,
    configuration?: Record<string, any>,
  ): Promise<Classroom> {
    const entity = await this.classroomRepo.findOne({ where: { id }, relations: ['members'] });
    if (!entity) throw new NotFoundException(`Channel ${id} not found`);

    if (typeof name === 'string' && name.length > 0) entity.name = name;
    if (typeof description !== 'undefined') entity.description = description;
    if (typeof configuration !== 'undefined') entity.configuration = configuration as any;

    const saved = await this.classroomRepo.save(entity);
    this.logger.log(`Channel updated: ${saved.name} (${saved.id})`);
    return saved as unknown as Classroom;
  }
}
