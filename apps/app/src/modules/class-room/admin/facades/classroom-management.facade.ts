import { Injectable, signal, computed } from '@angular/core';
import { Channel } from '../../../../common';
import { ChannelService } from '../../../../common/services/channel.service';
import { UserService } from '../../../../common/services/user.service';
import {PeerUserStoreService} from "../../../../common/peer/peer.service";
import { PeerBusService } from '../../../../common/peer/peer-bus.service';
import { JoinEvent, LeaveEvent } from '@ui-lib/apiClient';

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
    private channelService: ChannelService,
    private userStore: PeerUserStoreService,
    private eventBus: PeerBusService,
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

      const channel = await this.channelService.createChannel(
        request.name,
        request.description,
        currentUser.id as string
      );

      const classroomSummary = this.mapChannelToSummary(channel);

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
      const channels = await this.channelService.getChannelsFromUser(
        this.userStore.getCurrentUser()?.id as string,
      );
      const classrooms = channels.map(channel => this.mapChannelToSummary(channel));
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
      const channel = await this.channelService.getChannel(classroomId);
      return this.mapChannelToSummary(channel);
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
      const channel = await this.channelService.getChannelByCode(code);
      return this.mapChannelToSummary(channel);
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
      await this.channelService.joinChannel(classroomId, userId, displayName);

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
      await this.channelService.leaveChannel(classroomId, userId);

      await this.loadClassrooms(); // Refresh to update member count
    } catch (error) {
      console.error('Failed to remove user from classroom:', error);
      throw error;
    }
  }

  /**
   * Delete a classroom
   */
  async deleteClassroom(classroomId: string): Promise<boolean> {
    this.isLoadingSignal.set(true);

    try {
      await this.channelService.deleteChannel(classroomId);
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

  private mapChannelToSummary(channel: Channel): ClassroomSummary {
    return {
      id: channel.id,
      name: channel.name,
      description: channel.description as string,
      code: channel.code,
      memberCount: channel.members.length,
      createdAt: channel.createdAt as any,
      ownerId: channel.createdBy
    };
  }
}
