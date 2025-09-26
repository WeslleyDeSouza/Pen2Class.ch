import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassroomService } from '../classrooms/classroom.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonEntity } from './lesson.entity';
import { LessonTemplateEntity } from './lesson-template.entity';

export interface Lesson {
  id: string;
  classroomId: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdBy: string; // owner of the classroom
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LessonService {
  constructor(
    private readonly classroomService: ClassroomService,
    @InjectRepository(LessonEntity)
    private readonly typeRepo: Repository<LessonEntity>,
    @InjectRepository(LessonTemplateEntity)
    private readonly lessonRepo: Repository<LessonTemplateEntity>,
  ) {}

  async list(classroomId: string, requesterId?: string): Promise<Lesson[]> {
    // ensure classroom exists
    const classroom = await this.classroomService.getClassroom(classroomId);
    const all = await this.typeRepo.find({ where: { classroomId } });
    if (requesterId && requesterId === classroom.createdBy) return all as unknown as Lesson[];
    return (all as unknown as Lesson[]).filter(t => t.enabled);
  }

  async get(classroomId: string, lessonId: string, requesterId?: string): Promise<Lesson> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!lesson.enabled && requesterId !== classroom.createdBy) throw new ForbiddenException('Not visible');
    return lesson as unknown as Lesson;
  }

  async create(classroomId: string, name: string, description: string | undefined, createdBy: string): Promise<Lesson> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    if (classroom.createdBy !== createdBy) {
      throw new ForbiddenException('Only owner can create lessons');
    }
    const entity = this.typeRepo.create({
      classroomId,
      name,
      description: description ?? null,
      enabled: true,
      createdBy,
    });
    const saved = await this.typeRepo.save(entity);
    return saved as unknown as Lesson;
  }

  async update(
    classroomId: string,
    lessonId: string,
    requesterId: string,
    patch: { name?: string; description?: string , configuration?: Record<string, any>},
  ): Promise<Lesson> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
     if (classroom.createdBy !== requesterId) throw new ForbiddenException('Only owner can update lessons');
    if (typeof patch.name === 'string' && patch.name.trim()) lesson.name = patch.name;
    if (typeof patch.description !== 'undefined') lesson.description = patch.description ?? null;
    if (typeof patch.configuration !== 'undefined') lesson.configuration = patch.configuration ?? null;
    const saved = await this.typeRepo.save(lesson);
    return saved as unknown as Lesson;
  }

  async setEnabled(classroomId: string, lessonId: string, requesterId: string, enabled: boolean): Promise<Lesson> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (classroom.createdBy !== requesterId) throw new ForbiddenException('Only owner can enable/disable lessons');
    lesson.enabled = enabled;
    const saved = await this.typeRepo.save(lesson);
    return saved as unknown as Lesson;
  }

  async delete(classroomId: string, lessonId: string, requesterId: string): Promise<{ success: boolean }> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (classroom.createdBy !== requesterId) throw new ForbiddenException('Only owner can delete lessons');
    // Remove active lesson templates for this lesson first (if any)
    await this.lessonRepo.delete({ lessonId: lessonId });
    await this.typeRepo.delete(lessonId);
    return { success: true };
  }

  // Lesson controls
  async startLesson(classroomId: string, lessonId: string, userId: string): Promise<{ success: true }> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!lesson.enabled) throw new ForbiddenException('Lesson is disabled');
    // must be a member of the classroom
    const isMember = classroom.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this classroom');

    // idempotent create
    const existing = await this.lessonRepo.findOne({ where: { lessonId: lessonId, userId } });
    if (!existing) {
      const template = this.lessonRepo.create({ lessonId: lessonId, userId, classroomId });
      await this.lessonRepo.save(template);
    }

    return { success: true } as const;
  }

  async quitLesson(classroomId: string, lessonId: string, userId: string): Promise<{ success: true }> {
    const classroom = await this.classroomService.getClassroom(classroomId);
    const lesson = await this.typeRepo.findOne({ where: { id: lessonId, classroomId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    // quitting allowed regardless of enabled state, but must have access
    const isMember = classroom.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User has no access to this classroom');

    await this.lessonRepo.delete({ lessonId: lessonId, userId });
    return { success: true } as const;
  }

  async getActiveUsers(lessonId: string): Promise<string[]> {
    const rows = await this.lessonRepo.find({ where: { lessonId: lessonId } });
    return rows.map(r => r.userId);
  }
}
