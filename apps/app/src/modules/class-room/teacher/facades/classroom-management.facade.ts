import { Injectable, signal, computed } from '@angular/core';
import { ClassroomService } from '../../../../common/services/classroom.service';
import {UserStoreService} from "../../../../common/store";
import {ClassroomDto} from "@ui-lib/apiClient";

export interface ClassroomCreateRequest {
  name: string;
  description?: string;
}

export interface ClassroomSummary {
  id: string;
  name: string;
  description?: string;
  code: string;
  memberCount: number;
  createdAt: Date;
  ownerId: string;
  configuration?: {
    enabledTechnologies?: {
      html?: boolean;
      css?: boolean;
      javascript?: boolean;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class ClassroomManagementFacade {
  private classroomsSignal = signal<ClassroomSummary[]>([]);
  private isLoadingSignal = signal<boolean>(false);

  // Public readonly signals
  classrooms = this.classroomsSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  // Computed values
  myClassrooms = computed(() => {
    const currentUser = this.userStore.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return this.classroomsSignal().filter(classroom => classroom.ownerId === currentUser.id);
  });

  constructor(
    private classroomService: ClassroomService,
    private userStore: UserStoreService,
  ) {
  }

  /**
   * Create a new classroom
   */
  async createClassroom(request: ClassroomCreateRequest): Promise<ClassroomSummary> {
    this.isLoadingSignal.set(true);

    try {
      const currentUser = this.userStore.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to create a classroom');
      }

      const classroom = await this.classroomService.createClassroom(
        request.name,
        request.description,
        currentUser.id as string
      );

      const classroomSummary = this.mapClassroomToSummary(classroom);

      // Refresh the list
      await this.loadClassrooms();

      return classroomSummary;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get all classrooms
   */
  async loadClassrooms(): Promise<ClassroomSummary[]> {
    this.isLoadingSignal.set(true);

    try {
      const channels = await this.classroomService.getClassroomsFromUser(
        this.userStore.getCurrentUser()?.id as string,
      );
      const classrooms = channels.map(classroom => this.mapClassroomToSummary(classroom));
      this.classroomsSignal.set(classrooms);
      return classrooms;
    } catch (error) {
      console.error('Failed to load classrooms:', error);
      return [];
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get classroom by ID
   */
  async getClassroom(classroomId: string): Promise<ClassroomSummary | null> {
    try {
      const classroom = await this.classroomService.getClassroom(classroomId);
      return this.mapClassroomToSummary(classroom);
    } catch (error) {
      console.error('Failed to get classroom:', error);
      return null;
    }
  }

  /**
   * Get classroom by code
   */
  async getClassroomByCode(code: string): Promise<ClassroomSummary | null> {
    try {
      const classroom = await this.classroomService.getClassroomByCode(code);
      return this.mapClassroomToSummary(classroom);
    } catch (error) {
      console.error('Failed to get classroom by code:', error);
      return null;
    }
  }

  /**
   * Add a user to classroom
   */
  async addUserToClassroom(classroomId: string, userId: string,displayName:string): Promise<void> {
    try {
      await this.classroomService.joinClassroom(classroomId, userId, displayName);

      await this.loadClassrooms(); // Refresh to update member count
    } catch (error) {
      console.error('Failed to add user to classroom:', error);
      throw error;
    }
  }

  /**
   * Remove a user from classroom
   */
  async removeUserFromClassroom(classroomId: string, userId: string): Promise<void> {
    try {
      await this.classroomService.leaveClassroom(classroomId, userId);

      await this.loadClassrooms(); // Refresh to update member count
    } catch (error) {
      console.error('Failed to remove user from classroom:', error);
      throw error;
    }
  }

  /**
   * Update a classroom
   */
  async updateClassroom(classroomId: string, name: string, description?: string, configuration?: any): Promise<ClassroomSummary | null> {
    this.isLoadingSignal.set(true);

    try {
      const updatedClassroom = await this.classroomService.updateClassroom(classroomId, name, description, configuration);
      await this.loadClassrooms(); // Refresh the list
      return this.mapClassroomToSummary(updatedClassroom);
    } catch (error) {
      console.error('Failed to update classroom:', error);
      return null;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Delete a classroom
   */
  async deleteClassroom(classroomId: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    try {
      await this.classroomService.deleteClassroom(classroomId);
      await this.loadClassrooms(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      return false;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Refresh the classrooms list
   */
  async refresh(): Promise<void> {
    await this.loadClassrooms();
  }

  private mapClassroomToSummary(c: ClassroomDto): ClassroomSummary {
    return {
      id: c.id,
      name: c.name,
      description: c.description as string,
      code: c.code,
      memberCount: c.members.length,
      createdAt: c.createdAt as any,
      ownerId: c.createdBy,
      configuration: c.configuration as any
    };
  }
}
