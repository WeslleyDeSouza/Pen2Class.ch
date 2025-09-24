import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClassroomManagementFacade, ClassroomSummary } from '../admin/facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from '../admin/facades/lesson-management.facade';
import { PeerUserStoreService } from '../../../common/services/peer.service';
import { ChannelService } from '../../../common';

interface JoinClassroomForm {
  code: string;
}

@Component({
  selector: 'app-class-room-layout',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  template: `
    <div class="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Sidebar -->
      <div class="w-80 bg-white/80 backdrop-blur-sm shadow-lg flex flex-col border-r border-white/50">
        <!-- Top section - Join Classroom -->
        <div class="p-4 border-b border-white/40">
          <h2 class="text-lg font-semibold mb-3 text-gray-800">Join Classroom</h2>
          <div class="space-y-2">
            <input
              [(ngModel)]="joinForm.code"
              placeholder="Enter classroom code"
              class="w-full px-3 py-2 bg-white/90 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm"
              [disabled]="isJoining"
              (keyup.enter)="joinClassroom()"
            />
            <button
              (click)="joinClassroom()"
              [disabled]="isJoining || !joinForm.code.trim()"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-xl transition-colors text-sm font-medium shadow-sm"
            >
              {{ isJoining ? 'Joining...' : 'Join Classroom' }}
            </button>
            @if (joinError) {
              <div class="text-red-600 text-sm mt-1">{{ joinError }}</div>
            }
            @if (joinSuccess) {
              <div class="text-green-600 text-sm mt-1">{{ joinSuccess }}</div>
            }
          </div>
        </div>

        <!-- Classroom List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            <h2 class="text-lg font-semibold mb-3 text-gray-800">My Classrooms</h2>

            @if (classroomFacade.isLoading()) {
              <div class="text-center text-gray-500 py-4">Loading classrooms...</div>
            } @else if (classroomFacade.classrooms().length === 0) {
              <div class="text-center text-gray-500 py-4">No classrooms found. Join one above!</div>
            } @else {
              <div class="space-y-2">
                @for (classroom of classroomFacade.classrooms(); track classroom.id) {
                  <div class="border border-white/40 rounded-xl hover:bg-white/60 transition-colors backdrop-blur-sm bg-white/30">
                    <div
                      class="p-3 cursor-pointer"
                      [ngClass]="selectedClassroom()?.id === classroom.id ? 'bg-white/70 border-blue-400' : ''"
                      (click)="toggleClassroom(classroom)"
                    >
                      <div class="flex justify-between items-center">
                        <div class="flex-1">
                          <h3 class="font-medium text-gray-900">{{ classroom.name }}</h3>
                          @if (classroom.description) {
                            <p class="text-sm text-gray-600 mt-1">{{ classroom.description }}</p>
                          }
                          <div [hidden]="true" class="text-xs text-gray-500 mt-1">
                            {{ classroom.memberCount }} member(s) • Code: {{ classroom.code }}
                          </div>
                        </div>
                        <div class="text-gray-400">
                          @if (expandedClassrooms.has(classroom.id)) {
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"/>
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clip-rule="evenodd"/>
                            </svg>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Lessons -->
                    @if (expandedClassrooms.has(classroom.id)) {
                      <div class="border-t border-white/40 bg-white/50 backdrop-blur-sm">
                        @if (getLessonsForClassroom(classroom.id).length > 0) {
                          <div class="p-3 space-y-1">
                            @for (lesson of getLessonsForClassroom(classroom.id); track lesson.id) {
                              <div
                                class="p-2 border border-white/50 rounded-lg cursor-pointer hover:bg-white/90 transition-colors text-sm backdrop-blur-sm shadow-sm"
                                [ngClass]="selectedLesson()?.id === lesson.id ? 'bg-white/95' : 'bg-white/80'"
                                (click)="selectLesson(classroom, lesson)"
                              >
                                <div class="flex justify-between items-center">
                                  <div class="flex-1">
                                    <span class="font-medium text-gray-900">{{ lesson.name }}</span>
                                    @if (lesson.description) {
                                      <p class="text-xs text-gray-600 mt-1">{{ lesson.description }}</p>
                                    }
                                  </div>
                                  <div class="flex items-center space-x-1">
                                    @if (lesson.enabled) {
                                      <span class="inline-block w-2 h-2 bg-green-500 rounded-full"
                                            title="Active"></span>
                                    } @else {
                                      <span class="inline-block w-2 h-2 bg-gray-400 rounded-full"
                                            title="Inactive"></span>
                                    }
                                  </div>
                                </div>
                              </div>
                            }
                          </div>
                        } @else {
                          <div class="p-3 text-sm text-gray-500">No lessons available</div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        @if ( (selectedClassroom() || selectedLesson())  && false) {
          <div class="bg-white shadow-sm border-b border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                @if (selectedLesson(); as lesson) {
                  <h1 class="text-xl font-semibold text-gray-900">{{ lesson?.name }}</h1>
                  <p class="text-sm text-gray-600">{{ selectedClassroom()?.name }}</p>
                }
                @if (!selectedLesson()?.id && selectedClassroom(); as classroom) {
                  <h1 class="text-xl font-semibold text-gray-900">{{ classroom?.name }}</h1>
                  <p class="text-sm text-gray-600">Select a lesson to get started</p>
                }
              </div>
              <div class="flex space-x-2">
                @if (selectedLesson() && selectedLesson()?.enabled) {
                  <button
                    (click)="startLesson()"
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Start Lesson
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Router Outlet -->
        <div class="flex-1 overflow-auto p-1">
          @if (!selectedClassroom()) {
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8 h-full flex items-center justify-center">
              <div class="text-center">
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2M7 7h2v2H7V7zm0 4h2v2H7v-4zm0 4h2v2H7v-2z"/>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">No classroom selected</h3>
                <p class="mt-2 text-sm text-gray-500">Select a classroom from the sidebar to get started</p>
              </div>
            </div>
          } @else {
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg min-h-full" [hidden]="!selectedLesson()?.id">
              <router-outlet /></div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class ClassRoomLayout implements OnInit, OnDestroy {
  joinForm: JoinClassroomForm = { code: '' };
  isJoining = false;
  joinError = '';
  joinSuccess = '';

  selectedClassroom = signal<ClassroomSummary | null>(null);
  selectedLesson = signal<LessonSummary | null>(null);
  expandedClassrooms = new Set<string>();

  private subscriptions: Subscription[] = [];

  constructor(
    protected classroomFacade: ClassroomManagementFacade,
    private lessonFacade: LessonManagementFacade,
    private userStore: PeerUserStoreService,
    private channelService: ChannelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadData() {
    try {
      const classrooms = await this.classroomFacade.loadClassrooms();
      if (classrooms.length > 0) {
        const classroomIds = classrooms.map(c => c.id);
        await this.lessonFacade.loadLessonsForClassrooms(classroomIds);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async joinClassroom() {
    if (!this.joinForm.code.trim()) return;

    this.isJoining = true;
    this.joinError = '';
    this.joinSuccess = '';

    try {
      const currentUser = this.userStore.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in');
      }

      await this.channelService.joinByCode(
        this.joinForm.code.trim(),
        currentUser.id as string,
        currentUser.displayName as string,

      );

      this.joinSuccess = 'Successfully joined classroom!';
      this.joinForm.code = '';

      // Refresh classrooms list
      await this.loadData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.joinSuccess = '';
      }, 3000);
    } catch (error: any) {
      this.joinError = error.error?.message || error.message || 'Failed to join classroom';
    } finally {
      this.isJoining = false;
    }
  }

  toggleClassroom(classroom: ClassroomSummary) {
    if (this.expandedClassrooms.has(classroom.id)) {
      this.expandedClassrooms.delete(classroom.id);
    } else {
      this.expandedClassrooms.add(classroom.id);
    }
    this.selectedClassroom.set(classroom);
    this.userStore.selectedClassId.set(classroom.id);

    this.selectedLesson.set(null);
    this.userStore.selectedLessonId.set(null);
  }

  selectLesson(classroom: ClassroomSummary, lesson: LessonSummary) {
    this.selectedClassroom.set(classroom);
    this.userStore.selectedClassId.set(classroom.id);

    this.selectedLesson.set(lesson);
    this.userStore.selectedLessonId.set(lesson?.id);

    if( lesson.id) {
      this.initLessonMainPage()
    }
  }

  initLessonMainPage(){
    const lesson = this.selectedLesson();
    const classRoom = this.selectedClassroom()
    this.router.navigate(['/classroom',classRoom?.id,  'lesson', lesson?.id, 'editor']);
  }

  getLessonsForClassroom(classroomId: string): LessonSummary[] {
    return this.lessonFacade.getLessonsForClassroom(classroomId);
  }

  async startLesson() {
    const classroom = this.selectedClassroom();
    const lesson = this.selectedLesson();

    if (!classroom || !lesson) return;

    try {
      await this.lessonFacade.startLesson(classroom.id, lesson.id);

      // Navigate to editor with lesson context
      this.router.navigate(['/classroom', classroom.id, 'lesson', lesson.id, 'editor']);
    } catch (error) {
      console.error('Failed to start lesson:', error);
    }
  }
}
