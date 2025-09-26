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
    return this.classRoomApiService.classroomCreate({
      body: { name, description: description ?? undefined, createdBy }
    }) as unknown as Promise<ClassroomDto>;
  }

  getClassroomsFromUser(userId: string): Promise<Classroom[]> {
    return this.classRoomApiService.classroomGetAllFromUser({ userId }) as unknown as Promise<Classroom[]>;
  }

  getClassroom(classroomId: string): Promise<ClassroomDto> {
    return this.classRoomApiService.classroomGet({ classroomId }) as unknown as Promise<ClassroomDto>;
  }

  joinClassroom(classroomId: string, userId: string, displayName: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomJoinById({
      classroomId,
      body: { userId, displayName }
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  leaveClassroom(classroomId: string, userId: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomLeave({
      classroomId,
      body: { userId }
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  getClassroomMembers(classroomId: string): Promise<ClassroomMemberDto[]> {
    return this.classRoomApiService.classroomGetMembers({ classroomId }) as unknown as Promise<ClassroomMemberDto[]>;
  }

  getClassroomByCode(code: string): Promise<Classroom> {
    return this.classRoomApiService.classroomGetByCode({ code }) as unknown as Promise<Classroom>;
  }

  joinClassroomByCode(code: string, userId: string, displayName: string): Promise<JoinLeaveResponseDto> {
    return this.classRoomApiService.classroomJoinByCode({
      body: { userId, displayName ,  code: code,}
    }) as unknown as Promise<JoinLeaveResponseDto>;
  }

  updateClassroom(classroomId: string, name: string, description?: string, configuration?: any): Promise<ClassroomDto> {
    return this.classRoomApiService.classroomUpdate({
      body: { id: classroomId, name, description, configuration }
    }) as unknown as Promise<ClassroomDto>;
  }

  deleteClassroom(classroomId: string): Promise<SuccessResponseDto> {
    return this.classRoomApiService.classroomDelete({ classroomId }) as unknown as Promise<SuccessResponseDto>;
  }
}
