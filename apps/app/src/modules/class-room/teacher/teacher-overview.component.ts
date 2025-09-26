import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import {Router} from "@angular/router";
import { RouteConstants } from '../../../app/route.constants';
import {UserStoreService} from "../../../common/store";
import {UserDto} from "@ui-lib/apiClient";
import { ClassroomEntryItemComponent } from './components/classroom-entry-item.component';

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
  selector: 'app-admin-class-room-item',
  standalone: true,
  imports: [FormsModule, ClassroomEntryItemComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <!-- Left: Logo and Title -->
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Pen2Class Admin</h1>
                <p class="text-sm text-gray-500">Interactive Web Development Classroom</p>
              </div>
            </div>

            <!-- Center: Search -->
            <div [hidden]="true" class="flex-1 max-w-lg mx-8">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search classrooms, lessons..."
                  [(ngModel)]="searchQuery">
              </div>
            </div>

            <!-- Right: Notifications and Profile -->
            <div class="flex items-center space-x-4">
              <button class="p-2 text-gray-400 hover:text-gray-500 relative">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3.5-3.5a.5.5 0 0 1 0-.7l.5-.5-3-3-.5.5a.5.5 0 0 1-.7 0L9.5 6.5 8 8l3.5 3.5a.5.5 0 0 1 0 .7l-.5.5 3 3 .5-.5a.5.5 0 0 1 .7 0L18.5 18.5 15 17zM9 21H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4m0-10V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4m0 10v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4"></path>
                </svg>
                <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              @if (currentUser(); as user) {
                <div class="flex items-center space-x-3">
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">Teacher</div>
                    <div class="text-xs text-gray-500">{{user.displayName}}</div>
                  </div>
                  <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-white">{{$any(user).displayName?.charAt(0) || 'T'}}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Top Stats Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <!-- Active Classrooms -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Classrooms</p>
                <p class="text-2xl font-bold text-gray-900">{{classroomFacade.classrooms().length}}</p>
                <p class="text-xs text-gray-500 mt-1">Currently running sessions</p>
              </div>
            </div>
          </div>

          <!-- Total Lessons -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Lessons</p>
                <p class="text-2xl font-bold text-gray-900">{{lessonFacade.totalLessonCount()}}</p>
                <p class="text-xs text-gray-500 mt-1">Lessons created this month</p>
              </div>
            </div>
          </div>

          <!-- Student Sessions -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Student Sessions</p>
                <p class="text-2xl font-bold text-gray-900">{{lessonFacade.getActiveLessonCount()}}</p>
                <p class="text-xs text-gray-500 mt-1">Active coding sessions</p>
              </div>
            </div>
          </div>

          <!-- Real-time Views -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-center">

            </div>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div [hidden]="true" class="mb-8">
          <div class="flex items-center mb-4">
            <svg class="w-5 h-5 text-gray-900 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p class="text-sm text-gray-500 ml-2">Common tasks to manage your classrooms and lessons</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- New Classroom -->
            <button
              (click)="showCreateClassroom = true"
              class="bg-gray-900 hover:bg-gray-800 text-white p-6 rounded-xl transition-all duration-200 text-center group">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">New Classroom</h3>
              <p class="text-sm opacity-80">Create a coding session</p>
            </button>

            <!-- Add Lesson -->
            <button class="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 rounded-xl transition-all duration-200 text-center group">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Add Lesson</h3>
              <p class="text-sm text-gray-600">Create new exercise</p>
            </button>

            <!-- Monitor Sessions -->
            <button class="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-6 rounded-xl transition-all duration-200 text-center group">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Monitor Sessions</h3>
              <p class="text-sm text-gray-600">View student progress</p>
            </button>
          </div>
        </div>

        <!-- Getting Started Guide for New Teachers -->
        @if (lessonFacade.totalLessonCount() === 0) {
          <div class="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Welcome to pen2class! 👋</h3>
                <p class="text-blue-800 mb-4">Get started with your first HTML coding classroom in just a few simple steps:</p>
                <div class="space-y-3">
                  <div class="flex items-center space-x-3 text-blue-700">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm" [class]="classroomFacade.classrooms().length > 0 ? 'bg-green-500 text-white' : 'bg-blue-200'">
                      @if (classroomFacade.classrooms().length > 0) {
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      } @else {
                        <span>1</span>
                      }
                    </div>
                    <span class="font-medium">Create Classroom</span>
                  </div>
                  <div class="flex items-center space-x-3 text-blue-700">
                    <div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm">2</div>
                    <span class="font-medium">Add Lesson</span>
                  </div>
                  <div class="flex items-center space-x-3 text-blue-700">
                    <div class="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm">3</div>
                    <span class="font-medium">View and track student code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- My Classrooms Section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">My Classrooms</h2>
            <button
              (click)="showCreateClassroom = true"
              class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Add Classroom</span>
            </button>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6">
              @if (classroomFacade.classrooms().length === 0) {
                <div class="text-center py-16">
                  <div class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-3">No Classrooms Yet</h3>
                  <p class="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first classroom. You can add lessons, manage students, and track their progress.</p>
                  <button
                    (click)="showCreateClassroom = true"
                    class="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200">
                    Create Your First Classroom
                  </button>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  @for (classroom of classroomFacade.classrooms(); track classroom.id) {
                    <app-classroom-entry-item
                      [classroom]="classroom"
                      [lessonsCount]="getLessonsForClassroom(classroom.id).length || 0"
                      (copyCode)="copyToClipBoard($event)">
                    </app-classroom-entry-item>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Create Classroom Modal -->
      @if (showCreateClassroom) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="cancelCreateClassroom()">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="bg-gray-900 px-6 py-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">Create New Classroom</h3>
                <button
                  (click)="cancelCreateClassroom()"
                  class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Classroom Name *</label>
                  <input
                    [(ngModel)]="createChannelForm.name"
                    placeholder="Enter classroom name"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    autofocus>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    [(ngModel)]="createChannelForm.description"
                    placeholder="Enter classroom description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white resize-none">
                  </textarea>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex gap-3 mt-6">
                <button
                  (click)="cancelCreateClassroom()"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button
                  (click)="createClassroom()"
                  [disabled]="isCreatingClassroom || !createChannelForm.name.trim()"
                  class="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                  @if (isCreatingClassroom) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  } @else {
                    <span>Create Classroom</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
   `
})
export class AdminClassTeacherOverviewComponent implements OnInit, OnDestroy {
  currentUser = signal<UserDto | null>(null);

  searchQuery = '';
  createChannelForm: CreateChannelForm = { name: '', description: '' };
  createLessonForm: CreateLessonForm = { name: '', description: '', channelId: '' };

  showCreateClassroom = false;
  showCreateLessonFor = '';
  showActivityLog = false;
  isCreatingClassroom = false;
  isCreatingLesson = false;

  logEntries: { timestamp: string; message: string }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private userStore: UserStoreService,
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
    const currentUser = this.userStore.getCurrentUser();
    if (currentUser) {
      this.currentUser.set(<any>currentUser);
    }
  }

  private async initializeData() {
    try {
      const classrooms = await this.classroomFacade.loadClassrooms();

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


  getLessonsForClassroom(classroomId: string): LessonSummary[] {
    return this.lessonFacade.getLessonsForClassroom(classroomId);
  }

  copyToClipBoard(code: string) {
    if (!code) {
      this.log('No access code to copy');
      return;
    }
    const nav: any = navigator as any;
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
      nav.clipboard.writeText(code)
        .then(() => this.log('Access code copied to clipboard'))
        .catch(() => this.fallbackCopy(code));
      return;
    }
    this.fallbackCopy(code);
  }

  private fallbackCopy(text: string) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.log('Access code copied to clipboard');
    } catch (e) {
      this.log('Failed to copy access code');
    }
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.unshift({ timestamp, message });

    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(0, 100);
    }
  }

}
