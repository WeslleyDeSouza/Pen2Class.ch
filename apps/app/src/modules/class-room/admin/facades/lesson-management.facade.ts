import { Injectable, signal, computed } from '@angular/core';
import { LessonService, LessonType } from '../../../../common/services/lesson.service';
import {UserStoreService} from "../../../../common/store";

export interface LessonCreateRequest {
  createdBy: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface LessonSummary {
  id: string;
  name: string;
  description?: string;
  channelId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonsByClassroom {
  [classroomId: string]: LessonSummary[];
}

@Injectable({ providedIn: 'root' })
export class LessonManagementFacade {
  private lessonsSignal = signal<LessonsByClassroom>({});
  private isLoadingSignal = signal<boolean>(false);

  // Public readonly signals
  lessons = this.lessonsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  // Computed values
  allLessons = computed(() => Object.values(this.lessonsSignal()).flat());
  totalLessonCount = computed(() => this.allLessons().length);
  activeLessonCount = computed(() => this.allLessons().filter(lesson => lesson.enabled).length);

  constructor(
    private lessonService: LessonService,
    protected userStore:UserStoreService
  ) {}

  /**
   * Create a new lesson in a classroom
   */
  async createLesson(classroomId: string, request: LessonCreateRequest): Promise<LessonSummary> {
    this.isLoadingSignal.set(true);

    try {
      const lesson = await this.lessonService.create(classroomId, {
        createdBy: request.createdBy,
        name: request.name,
        description: request.description,
      });

      const lessonSummary = this.mapChannelTypeToSummary(lesson, classroomId);

      // Refresh lessons for this classroom
      await this.loadLessonsForClassroom(classroomId);

      return lessonSummary;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load lessons for a specific classroom
   */
  async loadLessonsForClassroom(classroomId: string): Promise<LessonSummary[]> {
    this.isLoadingSignal.set(true);

    try {
      const _lessons = await this.lessonService.list(classroomId);
      const lessons = _lessons.map(ct => this.mapChannelTypeToSummary(ct, classroomId));

      // Update the lessons map
      const currentLessons = this.lessonsSignal();
      const updatedLessons = {
        ...currentLessons,
        [classroomId]: lessons
      };
      this.lessonsSignal.set(updatedLessons);

      return lessons;
    } catch (error) {
      console.error('Failed to load lessons for classroom:', error);
      return [];
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Load lessons for multiple classrooms
   */
  async loadLessonsForClassrooms(classroomIds: string[]): Promise<LessonsByClassroom> {
    this.isLoadingSignal.set(true);

    try {
      const updatedLessons: LessonsByClassroom = { ...this.lessonsSignal() };

      const promises = classroomIds.map(async (classroomId) => {
        try {
          const channelTypes = await this.lessonService.list(classroomId);
          const lessons = channelTypes.map(ct => this.mapChannelTypeToSummary(ct, classroomId));
          updatedLessons[classroomId] = lessons;
        } catch (error) {
          console.error(`Failed to load lessons for classroom ${classroomId}:`, error);
          updatedLessons[classroomId] = updatedLessons[classroomId] || [];
        }
      });

      await Promise.allSettled(promises);
      this.lessonsSignal.set(updatedLessons);

      return updatedLessons;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get a specific lesson
   */
  async getLesson(classroomId: string, lessonId: string): Promise<LessonSummary | null> {
    try {
      const lesson = await this.lessonService.get(classroomId, lessonId);
      return this.mapChannelTypeToSummary(lesson, classroomId);
    } catch (error) {
      console.error('Failed to get lesson:', error);
      return null;
    }
  }

  /**
   * Update a lesson
   */
  async updateLesson(
    classroomId: string,
    lessonId: string,
    updates: Partial<LessonCreateRequest>
  ): Promise<LessonSummary | null> {
    this.isLoadingSignal.set(true);

    try {
      const lesson = await this.lessonService.update(classroomId, lessonId, updates);
      const lessonSummary = this.mapChannelTypeToSummary(lesson, classroomId);

      // Refresh lessons for this classroom
      await this.loadLessonsForClassroom(classroomId);

      return lessonSummary;
    } catch (error) {
      console.error('Failed to update lesson:', error);
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Enable a lesson
   */
  async enableLesson(classroomId: string, lessonId: string): Promise<boolean> {
    try {
      await this.lessonService.enable(classroomId, lessonId);
      await this.loadLessonsForClassroom(classroomId);
      return true;
    } catch (error) {
      console.error('Failed to enable lesson:', error);
      return false;
    }
  }

  /**
   * Disable a lesson
   */
  async disableLesson(classroomId: string, lessonId: string): Promise<boolean> {
    try {
      await this.lessonService.disable(classroomId, lessonId);
      await this.loadLessonsForClassroom(classroomId);
      return true;
    } catch (error) {
      console.error('Failed to disable lesson:', error);
      return false;
    }
  }

  /**
   * Start a lesson
   */
  async   startLesson(classroomId: string, lessonId: string): Promise<boolean> {
    try {
      await this.lessonService.startLesson(classroomId, lessonId, this.userStore.getCurrentUser()?.id as string);
      return true;
    } catch (error) {
      console.error('Failed to start lesson:', error);
      return false;
    }
  }

  /**
   * Stop/quit a lesson
   */
  async stopLesson(classroomId: string, lessonId: string): Promise<boolean> {
    try {
      await this.lessonService.quitLesson(classroomId, lessonId, this.userStore.getCurrentUser()?.id as string);
      return true;
    } catch (error) {
      console.error('Failed to stop lesson:', error);
      return false;
    }
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(classroomId: string, lessonId: string,userId:string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    try {
      await this.lessonService.delete(classroomId, lessonId, userId);
      await this.loadLessonsForClassroom(classroomId);
      return true;
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get lessons for a specific classroom
   */
  getLessonsForClassroom(classroomId: string): LessonSummary[] {
    return this.lessonsSignal()[classroomId] || [];
  }

  /**
   * Get all lessons across all classrooms
   */
  getAllLessons(): LessonSummary[] {
    return this.allLessons();
  }

  /**
   * Get total lesson count
   */
  getTotalLessonCount(): number {
    return this.totalLessonCount();
  }

  /**
   * Get active lesson count
   */
  getActiveLessonCount(): number {
    return this.activeLessonCount();
  }

  /**
   * Clear lessons for a classroom
   */
  clearLessonsForClassroom(classroomId: string): void {
    const currentLessons = this.lessonsSignal();
    const updatedLessons = { ...currentLessons };
    delete updatedLessons[classroomId];
    this.lessonsSignal.set(updatedLessons);
  }

  private mapChannelTypeToSummary(channelType: LessonType, classroomId: string): LessonSummary {
    return {
      id: channelType.id,
      name: channelType.name,
      description: channelType.description as string,
      channelId: classroomId,
      enabled: channelType.enabled || false,
      createdAt: channelType.createdAt as any,
      updatedAt: channelType.updatedAt as any
    };
  }
}
