import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { User } from '../../../common';
import { UserService } from '../../../common/services/user.service';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import {PeerUserStoreService} from "../../../common/services/peer.service";

interface CreateChannelForm {
  name: string;
  description: string;
}

interface CreateLessonForm {
  name: string;
  description: string;
  channelId: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-blue-600 text-white p-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <h1 class="text-2xl font-bold">Admin Dashboard</h1>
          <div class="flex items-center gap-4">
            @if (currentUser(); as user) {
              <span class="text-blue-100">
                Welcome, {{user.displayName}}!
              </span>
            }
          </div>
        </div>
      </header>

      <div class="max-w-6xl mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Classroom Management -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Classroom Management</h2>
              <button
                (click)="showCreateClassroom = true"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
                Create Classroom
              </button>
            </div>

            <!-- Create Classroom Form -->
            @if (showCreateClassroom) {
              <div class="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 class="font-semibold mb-3">Create New Classroom</h3>
                <div class="space-y-3">
                  <input
                    [(ngModel)]="createChannelForm.name"
                    placeholder="Classroom name"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <textarea
                    [(ngModel)]="createChannelForm.description"
                    placeholder="Description"
                    rows="3"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </textarea>
                  <div class="flex gap-2">
                    <button
                      (click)="createClassroom()"
                      [disabled]="isCreatingClassroom || !createChannelForm.name.trim()"
                      class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors">
                      {{isCreatingClassroom ? 'Creating...' : 'Create'}}
                    </button>
                    <button
                      (click)="cancelCreateClassroom()"
                      class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Classroom List -->
            <div class="space-y-3 max-h-96 overflow-y-auto">
              @for (classroom of classroomFacade.classrooms(); track classroom.id) {
                <div class="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold">{{classroom.name}}</h3>
                      @if (classroom.description) {
                        <p class="text-sm text-gray-600 mb-2">{{classroom.description}}</p>
                      }
                      <div class="text-xs text-gray-500 mb-2">
                        <span>{{$any(classroom).members?.length}} member(s)</span>
                        <span class="ml-2">Created: {{classroom.createdAt | date:'short'}}</span>
                      </div>
                      <div class="p-2 bg-blue-50 rounded border border-blue-200">
                        <span class="text-xs text-blue-600 font-medium">Code:</span>
                        <code class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">{{classroom.code}}</code>
                      </div>

                      <!-- Lessons for this classroom -->
                      <div class="mt-3">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-sm font-medium text-gray-700">Lessons ({{getLessonsForClassroom(classroom.id).length}})</span>
                          <button
                            (click)="showCreateLessonFor = showCreateLessonFor === classroom.id ? '' : classroom.id"
                            class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors">
                            + Add Lesson
                          </button>
                        </div>

                        <!-- Create lesson form for this classroom -->
                        @if (showCreateLessonFor === classroom.id) {
                          <div class="mb-2 p-2 border rounded bg-green-50">
                            <div class="space-y-2">
                              <input
                                [(ngModel)]="createLessonForm.name"
                                placeholder="Lesson name"
                                class="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
                              <textarea
                                [(ngModel)]="createLessonForm.description"
                                placeholder="Lesson description"
                                rows="2"
                                class="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500">
                              </textarea>
                              <div class="flex gap-2">
                                <button
                                  (click)="createLesson(classroom.id)"
                                  [disabled]="isCreatingLesson || !createLessonForm.name.trim()"
                                  class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs transition-colors">
                                  {{isCreatingLesson ? 'Creating...' : 'Create'}}
                                </button>
                                <button
                                  (click)="cancelCreateLesson()"
                                  class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        }

                        <!-- Lessons list -->
                        <div class="space-y-1">
                          @for (lesson of getLessonsForClassroom(classroom.id); track lesson.id) {
                            <div class="p-2 border rounded bg-green-50 text-sm">
                              <div class="flex justify-between items-start">
                                <div class="flex-1">
                                  <span class="font-medium text-green-800">{{lesson.name}}</span>
                                  @if (lesson.description) {
                                    <p class="text-xs text-green-600 mt-1">{{lesson.description}}</p>
                                  }
                                  <div class="text-xs text-green-500 mt-1">
                                    Status: {{lesson.enabled ? 'Active' : 'Inactive'}}
                                  </div>
                                </div>
                                <div class="flex gap-1">
                                  @if (lesson.enabled) {
                                    <button
                                      (click)="disableLesson(classroom.id, lesson.id)"
                                      class="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded transition-colors">
                                      Disable
                                    </button>
                                  } @else {
                                    <button
                                      (click)="enableLesson(classroom.id, lesson.id)"
                                      class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors">
                                      Enable
                                    </button>
                                  }
                                  <button
                                    (click)="startLesson(classroom.id, lesson.id)"
                                    [disabled]="!lesson.enabled"
                                    class="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-2 py-1 rounded transition-colors">
                                    Start
                                  </button>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Statistics & Quick Actions -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold mb-4">Dashboard Overview</h2>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="text-2xl font-bold text-blue-800">{{classroomFacade.classrooms().length}}</div>
                <div class="text-sm text-blue-600">Total Classrooms</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="text-2xl font-bold text-green-800">{{lessonFacade.totalLessonCount()}}</div>
                <div class="text-sm text-green-600">Total Lessons</div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="mt-6">
              <h3 class="font-semibold mb-3">Activity Log</h3>
              <div class="bg-gray-50 p-4 rounded h-48 overflow-y-auto font-mono text-sm">
                @for (entry of logEntries; track entry.timestamp) {
                  <div class="mb-1 text-xs">
                    <span class="text-gray-500">[{{entry.timestamp}}]</span> {{entry.message}}
                  </div>
                }
              </div>
              <button
                (click)="clearLog()"
                class="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                Clear Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser = signal<User | null>(null);

  createChannelForm: CreateChannelForm = { name: '', description: '' };
  createLessonForm: CreateLessonForm = { name: '', description: '', channelId: '' };

  showCreateClassroom = false;
  showCreateLessonFor = '';
  isCreatingClassroom = false;
  isCreatingLesson = false;

  logEntries: { timestamp: string; message: string }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private userStore: PeerUserStoreService,
    private userService: UserService,
    public classroomFacade: ClassroomManagementFacade,
    public lessonFacade: LessonManagementFacade
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.initializeData();
    this.log('Admin dashboard initialized');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser() {
    // Get current user from UserService if available
    const currentUser = this.userStore.getCurrentUser();
    if (currentUser) {
      this.currentUser.set(<any>currentUser);
    }
  }

  private async initializeData() {
    try {
      // Load classrooms first
      const classrooms = await this.classroomFacade.loadClassrooms();

      // Then load lessons for all classrooms
      if (classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        await this.lessonFacade.loadLessonsForClassrooms(classroomIds);
      }
    } catch (error: any) {
      this.log(`Failed to initialize data: ${error.error?.message || error.message}`);
    }
  }

  async createClassroom() {
    if (!this.createChannelForm.name.trim()) {
      this.log('Classroom name is required');
      return;
    }

    this.isCreatingClassroom = true;

    try {
      const classroom = await this.classroomFacade.createClassroom({
        name: this.createChannelForm.name.trim(),
        description: this.createChannelForm.description.trim() || undefined
      });

      this.log(`Created classroom: ${classroom.name}`);
      this.createChannelForm = { name: '', description: '' };
      this.showCreateClassroom = false;

      // Reload lessons for the new classroom
      await this.lessonFacade.loadLessonsForClassroom(classroom.id);
    } catch (error: any) {
      this.log(`Failed to create classroom: ${error.error?.message || error.message}`);
    } finally {
      this.isCreatingClassroom = false;
    }
  }

  cancelCreateClassroom() {
    this.createChannelForm = { name: '', description: '' };
    this.showCreateClassroom = false;
  }

  async createLesson(channelId: string) {
    if (!this.createLessonForm.name.trim()) {
      this.log('Lesson name is required');
      return;
    }

    this.isCreatingLesson = true;

    try {
      const lesson = await this.lessonFacade.createLesson(channelId, {
        createdBy:this.userStore.getCurrentUser()?.id as string,
        name: this.createLessonForm.name.trim(),
        description: this.createLessonForm.description.trim() || undefined,
        enabled: true
      });

      this.log(`Created lesson: ${lesson.name}`);
      this.createLessonForm = { name: '', description: '', channelId: '' };
      this.showCreateLessonFor = '';
    } catch (error: any) {
      this.log(`Failed to create lesson: ${error.error?.message || error.message}`);
    } finally {
      this.isCreatingLesson = false;
    }
  }

  cancelCreateLesson() {
    this.createLessonForm = { name: '', description: '', channelId: '' };
    this.showCreateLessonFor = '';
  }

  async enableLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.enableLesson(channelId, lessonId);
    if (success) {
      this.log(`Enabled lesson`);
    } else {
      this.log(`Failed to enable lesson`);
    }
  }

  async disableLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.disableLesson(channelId, lessonId);
    if (success) {
      this.log(`Disabled lesson`);
    } else {
      this.log(`Failed to disable lesson`);
    }
  }

  async startLesson(channelId: string, lessonId: string) {
    const success = await this.lessonFacade.startLesson(channelId, lessonId);
    if (success) {
      this.log(`Started lesson`);
    } else {
      this.log(`Failed to start lesson`);
    }
  }

  getLessonsForClassroom(classroomId: string): LessonSummary[] {
    return this.lessonFacade.getLessonsForClassroom(classroomId);
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.unshift({ timestamp, message });

    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(0, 100);
    }
  }

  clearLog() {
    this.logEntries = [];
  }
}
