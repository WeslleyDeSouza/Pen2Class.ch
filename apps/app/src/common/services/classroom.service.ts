import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  ClassroomDto,
  ClassroomMemberDto,
  JoinLeaveResponseDto,
  SuccessResponseDto,
  ClassroomsService as ClassroomApiService
} from '@ui-lib/apiClient';

export type Classroom = ClassroomDto;

@Injectable({ providedIn: 'root' })
export class ClassroomService {
  private readonly rootUrl = environment.apiUrl;

  constructor(protected classRoomApiService: ClassroomApiService) {
    this.classRoomApiService.rootUrl = this.rootUrl;
  }

  createClassroom(name: string, description: string | undefined, createdBy: string): Promise<ClassroomDto> {
    return this.classRoomApiService.classroomCreateChannel({
      body: { name, description: description ?? undefined, createdBy }
    }) as unknown as Promise<ClassroomDto>;
  }

  getClassrooms(): Promise<Classroom[]> {
    return this.classRoomApiService.classroomGetAllChannels({}) as unknown as Promise<Classroom[]>;
  }

  getClassroomsFromUser(userId: string): Promise<Classroom[]> {
    return this.classRoomApiService.classroomGetAllChannelsWithPermission({ userId }) as unknown as Promise<Classroom[]>;
  }

  getClassroom(classroomId: string): Promise<ClassroomDto> {
    return this.classRoomApiService.classroomGetChannel({ classroomId }) as unknown as Promise<ClassroomDto>;
  }

  joinClassroom(classroomId: string, userId: string, displayName: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomJoinChannel({
      classroomId,
      body: { userId, displayName }
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  leaveClassroom(classroomId: string, userId: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomLeaveChannel({
      classroomId,
      body: { userId }
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  getClassroomMembers(classroomId: string): Promise<ClassroomMemberDto[]> {
    return this.classRoomApiService.classroomGetChannelMembers({ classroomId }) as unknown as Promise<ClassroomMemberDto[]>;
  }

  getClassroomByCode(code: string): Promise<Classroom> {
    return this.classRoomApiService.classroomGetChannelByCode({ code }) as unknown as Promise<Classroom>;
  }

  joinClassroomByCode(code: string, userId: string, displayName: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomJoinChannelByCode({
      body: { code, userId, displayName }
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  deleteClassroom(classroomId: string): Promise<SuccessResponseDto> {
    return this.classRoomApiService.classroomDeleteChannel({ classroomId }) as unknown as Promise<SuccessResponseDto>;
  }
}
