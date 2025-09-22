import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PeerUserStoreService } from '../../../../common/services/peer.service';
import { EditorStoreService, EditorState } from './editor-store.service';
import { LessonObjectsService, PeerObjectDto } from '@ui-lib/apiClient';

interface SaveOptions {
  objectId?: string;
  channelId?: string;
  channelTypeId?: string;
  type?: string; // defaults to 'editor-state'
}

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly peerUserStoreService: PeerUserStoreService = inject(PeerUserStoreService);
  private readonly editorStore: EditorStoreService = inject(EditorStoreService);
  private readonly objectsApi: LessonObjectsService = inject(LessonObjectsService);

  constructor() {
    // Ensure API client points to our backend URL
    this.objectsApi.rootUrl = environment.apiUrl;
  }

  // Convenience getters
  private get currentUserId(): string | undefined {
    return this.peerUserStoreService.getCurrentUser()?.id as any;
  }
  getByKey(){
    const userId = this.peerUserStoreService.getCurrentUser()?.id as string;
    const channelId = this.peerUserStoreService.selectedClassId() || '';
    const channelTypeId = this.peerUserStoreService.selectedLessonId() || '';

    if (!userId) {
      throw new Error('userId is required to get object by key');
    }
    if (!channelId) {
      throw new Error('channelId is required to get object by key');
    }
    if (!channelTypeId) {
      throw new Error('channelTypeId is required to get object by key');
    }

    return this.objectsApi.objectGetByKey({
      type: 'EDITOR_STATE',
      userId: userId,
      channelId: channelId,
      channelTypeId: channelTypeId,
    })
  }
  /**
   * Save current editor state. Creates a new object if no objectId provided; otherwise updates existing.
   */
  async saveEditorState(opts?: SaveOptions  , objectId?:string): Promise<PeerObjectDto> {
    const state = this.editorStore.editorState();
    const type = opts?.type || 'EDITOR_STATE';

    if (opts?.objectId || objectId) {
      return this.updateObject(opts?.objectId || objectId as string, state, type);
    }

    const channelId = opts?.channelId || this.peerUserStoreService.selectedClassId() || '';
    const channelTypeId = opts?.channelTypeId ||  this.peerUserStoreService.selectedLessonId();

    if (!channelId) {
      throw new Error('channelId is required to create an object');
    }
    if (!channelTypeId) {
      throw new Error('channelId is required to create an object');
    }

    const userId = this.currentUserId || '';
    if (!userId) {
      throw new Error('userId is required to create an object');
    }

    return this.objectsApi.objectUpsert({
      body: {
        channelId,
        channelTypeId,
        userId,
        type,
        data: state as unknown as Record<string, any>
      }
    });
  }

  /** Update object data (defaults to current editor state). */
  async updateObject(id: string, state?: EditorState, type?: string): Promise<PeerObjectDto> {
    const data = state ?? this.editorStore.editorState();
    return this.objectsApi.objectUpdate({
      id,
      body: {
        type: type || 'editor-state',
        data: data as unknown as Record<string, any>
      }
    });
  }

  /** Fetch an object by id. */
  getObject(id: string): Promise<PeerObjectDto> {
    return this.objectsApi.objectGetById({ id });
  }

  /** Delete an object by id. */
  deleteObject(id: string): Promise<any> {
    return this.objectsApi.objectDelete({ id });
  }

  /** List objects by channel id. */
  listObjectsByChannel(channelId: string): Promise<PeerObjectDto[]> {
    return this.objectsApi.objectGetByChannel({ channelId });
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
