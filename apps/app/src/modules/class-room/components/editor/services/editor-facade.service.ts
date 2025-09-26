import { inject, Injectable } from '@angular/core';
import { EditorStoreService, EditorState } from './editor-store.service';
import {ResourceDto, ResourcesService, } from '@ui-lib/apiClient';
import { UserStoreService } from "apps/app/src/common/store";
import {environment} from "../../../../../environments/environment";

interface SaveOptions {
  objectId?: string;
  classroomId?: string;
  userId?: string;
  lessonId?: string;
  type?: string; // defaults to 'editor-state'
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly userStoreService: UserStoreService = inject(UserStoreService);
  private readonly editorStore: EditorStoreService = inject(EditorStoreService);
  private readonly resourceApi: ResourcesService = inject(ResourcesService);

  constructor() {
    // Ensure API client points to our backend URL
    this.resourceApi.rootUrl = environment.apiUrl;
  }

  // Convenience getters
  private get currentUserId(): string | undefined {
    return this.userStoreService.getCurrentUser()?.id as any;
  }
  getByKey(params?:{userId?:string,classroomId?:string, lessonId?:string}){
    const userId = params?.userId || this.userStoreService.getCurrentUser()?.id as string;
    const classroomId =  params?.classroomId ||this.userStoreService.selectedClassId() || '';
    const lessonId =  params?.lessonId ||this.userStoreService.selectedLessonId() || '';

    if (!userId) {
      throw new Error('userId is required to get object by key');
    }
    if (!classroomId) {
      throw new Error('classroomId is required to get object by key');
    }
    if (!lessonId) {
      throw new Error('lessonId is required to get object by key');
    }

    return this.resourceApi.resourceGetByKey({
      type: 'EDITOR_STATE',
      userId: userId,
      classroomId: classroomId,
      lessonId: lessonId,
    })
  }
  /**
   * Save current editor state. Creates a new object if no objectId provided; otherwise updates existing.
   */
  async saveEditorState(opts?: SaveOptions  , objectId?:string): Promise<ResourceDto> {
    const state = this.editorStore.editorState();
    const type = opts?.type || 'EDITOR';

    if (opts?.objectId || objectId) {
      return this.updateObject(opts?.objectId || objectId as string, state, type);
    }

    const classroomId = opts?.classroomId || this.userStoreService.selectedClassId() || '';
    const lessonId = opts?.lessonId ||  this.userStoreService.selectedLessonId();

    if (!classroomId) {
      throw new Error('classroomId is required to create an object');
    }
    if (!lessonId) {
      throw new Error('classroomId is required to create an object');
    }

    const userId = opts?.userId || this.currentUserId || '';
    if (!userId) {
      throw new Error('userId is required to create an object');
    }

    return this.resourceApi.resourceUpsert({
      body: {
        classroomId,
        lessonId,
        userId,
        type:type as any,
        data: state as unknown as Record<string, any>
      }
    });
  }

  /** Update object data (defaults to current editor state). */
  async updateObject(id: string, state?: EditorState, type?: string): Promise<ResourceDto> {
    const data = state ?? this.editorStore.editorState();
    return this.resourceApi.resourceUpdate({
      id,
      body: {
        type: <any>type || 'EDITOR',
        data: data as unknown as Record<string, any>
      }
    });
  }

  /** Fetch an object by id. */
  getObject(id: string): Promise<ResourceDto> {
    return this.resourceApi.resourceGetById({ id });
  }

  /** Delete an object by id. */
  deleteObject(id: string): Promise<any> {
    return this.resourceApi.resourceDelete({ id });
  }

  /** List objects by channel id. */
  listObjectsByChannel(classroomId: string): Promise<ResourceDto[]> {
    return this.resourceApi.resourceGetByClassroom({ classroomId });
  }

  /** Load editor state from an existing object (expects data payload with html/css/js). */
  async loadEditorStateFromObject(id: string): Promise<EditorState> {
    const obj = await this.getObject(id);
    const data = (obj?.data || {}) as any;
    const state: EditorState = {
      html: data.html || '',
      css: data.css || '',
      js: data.js || ''
    };
    this.editorStore.loadEditorState(state);
    return state;
  }
}
