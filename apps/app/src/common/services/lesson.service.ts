import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
 LessonsService as LessonApiService,
  SuccessDto, LessonDto,
  CreateLessonDto,
  UpdateLessonDto
} from '@ui-lib/apiClient';

export interface LessonType extends LessonDto {}

@Injectable({ providedIn: 'root' })
export class LessonService {
  private readonly rootUrl = environment.apiUrl;

  constructor(private lessonApi: LessonApiService) {
    this.lessonApi.rootUrl = this.rootUrl;
  }

  // List all channel types for a given classroom
  list(classroomId: string): Promise<LessonType[]> {
    return this.lessonApi.lessonList({ classroomId }) as unknown as Promise<LessonType[]>;
  }

  // Create a new channel type
  create(classroomId: string, body: CreateLessonDto): Promise<LessonDto> {
    return this.lessonApi.lessonCreate({ classroomId, body:{
        createdBy: body.createdBy,
        description: body.description,
        name: body.name
      } });
  }

  // Get a specific lesson
  get(classroomId: string, lessonId: string): Promise<LessonDto> {
    return this.lessonApi.lessonGet({ classroomId, lessonId });
  }

  // Update a channel type
  update(
    classroomId: string,
    lessonId: string,
    body: { name?: string; description?: string;configuration?: string; visible?: boolean, userId:string }
  ): Promise<LessonDto> {
    return this.lessonApi.lessonUpdate({ classroomId, lessonId, body });
  }

  // Delete a channel type
  delete(classroomId: string, lessonId: string,userId:string): Promise<SuccessDto> {
    return this.lessonApi.lessonDelete({ classroomId, lessonId, body: {
        requestedBy:userId
      } });
  }

  // Enable a channel type
  enable(classroomId: string, lessonId: string): Promise<LessonDto> {
    return this.lessonApi.lessonEnable({ classroomId, lessonId, body: {
        enabled: true,
        requestedBy: ''
      } });
  }

  // Disable a channel type
  disable(classroomId: string, lessonId: string): Promise<LessonDto> {
    return this.lessonApi.lessonDisable({ classroomId, lessonId, body: {
        enabled: false,
        requestedBy: ''
      } });
  }

  // Start a lesson for the channel type
  startLesson(classroomId: string, lessonId: string, userId:string): Promise<SuccessDto> {
    return this.lessonApi.lessonStartLesson({ classroomId, lessonId, body: {
        userId
      }
    });
  }

  // Quit a lesson for the channel type
  quitLesson(classroomId: string, lessonId: string, userId:string): Promise<SuccessDto> {
    return this.lessonApi.lessonQuitLesson({ classroomId, lessonId,body:{
        userId
      }});
  }
}
