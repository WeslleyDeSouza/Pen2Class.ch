import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LessonDialogComponent, LessonDialogModel } from './components/lesson-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassroomManagementFacade, ClassroomSummary } from './facades/classroom-management.facade';
import { LessonManagementFacade, LessonSummary } from './facades/lesson-management.facade';
import { Subscription } from 'rxjs';
import { ClassroomService } from '../../../common';
import { UserStoreService } from '../../../common/store';
import { RouteConstants } from '../../../app/route.constants';

interface StudentSummary {
  userId: string;
  displayName: string;
  status?: 'Active' | 'Coding' | 'Idle';
}

@Component({
  selector: 'app-admin-class-room-overview',
  standalone: true,
  imports: [CommonModule, DatePipe, LessonDialogComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-6">
          <button (click)="goBack()" class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <div>
            <div class="text-sm text-gray-500">Classroom</div>
            <div class="text-xl font-semibold text-gray-900">{{ classroom()?.name || 'Classroom' }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left column -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Access code card -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-sm text-gray-600">Access Code</div>
                  <div class="text-3xl font-semibold tracking-wider text-gray-900 select-all">{{ classroom()?.code || '------' }}</div>
                  <div class="text-xs text-gray-500 mt-2">Share this code with students</div>
                </div>
                <button (click)="copyCode()" class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="Copy">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8a2 2 0 012 2v8m-2 2H8a2 2 0 01-2-2V9m2-6h8a2 2 0 012 2v2M6 5a2 2 0 012-2" />
                  </svg>
                </button>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-3 gap-3 mt-6">
                <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div class="text-indigo-600 text-lg font-bold">{{ members().length }}</div>
                  <div class="text-xs text-gray-500">Students</div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div class="text-emerald-600 text-lg font-bold">{{ lessons().length }}</div>
                  <div class="text-xs text-gray-500">Lessons</div>
                </div>
                <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div class="text-purple-600 text-lg font-bold">{{ activeLessons() }}</div>
                  <div class="text-xs text-gray-500">Active</div>
                </div>
              </div>
            </div>

            <!-- Technologies -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div class="text-gray-900 font-medium mb-3">Technologies</div>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700" *ngFor="let tech of technologies">{{tech}}</span>
              </div>
            </div>

            <!-- Students -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
              <div class="flex items-center justify-between px-3 py-2">
                <div class="text-gray-900 font-medium">Students ({{ members().length }})</div>
                <button class="text-xs text-blue-600 hover:underline" (click)="viewAllStudents()">View All</button>
              </div>
              <ul class="divide-y divide-gray-100">
                <li class="px-3 py-3 flex items-center" *ngFor="let s of members().slice(0, 5)">
                  <span class="w-2 h-2 rounded-full mr-3" [ngClass]="{
                    'bg-green-500': s.status==='Active',
                    'bg-blue-500': s.status==='Coding',
                    'bg-gray-300': !s.status || s.status==='Idle'
                  }"></span>
                  <div class="flex-1 truncate">{{s.displayName || s.userId}}</div>
                  <span class="text-xs text-gray-500 px-2 py-1 rounded-lg border" *ngIf="s.status">{{s.status}}</span>
                </li>
              </ul>
              <div class="text-center text-xs text-gray-500 py-3" *ngIf="members().length > 5">+{{ members().length - 5 }} more students</div>
            </div>
          </div>

          <!-- Right column: Lessons -->
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center justify-between">
              <div class="text-xl font-semibold text-gray-900">Lessons</div>
              <button (click)="addLesson()" class="inline-flex items-center px-3 py-2 rounded-xl bg-black text-white hover:bg-gray-800">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Add Lesson
              </button>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-0" *ngFor="let l of lessons()">
              <div class="p-5 flex items-center">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h10M4 18h6"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="font-medium text-gray-900 truncate">{{ l.name }}</div>
                    <span class="text-xs px-2 py-0.5 rounded-full" [ngClass]="l.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'">
                      {{ l.enabled ? 'active' : 'draft' }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-4">
                    <span class="inline-flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857"/></svg>{{ members().length }} students</span>
                    <span class="inline-flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"/></svg>~{{ defaultDuration }} min</span>
                  </div>
                  <div class="mt-3">
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-gray-900" [style.width.%]="l.enabled ? 100 : 75"></div>
                    </div>
                    <div class="text-[10px] text-right text-gray-400 mt-1">{{ l.enabled ? '100%' : '75%' }}</div>
                  </div>
                </div>
                <div class="ml-4 flex items-center gap-3 text-gray-500">
                  <button class="hover:text-gray-700" title="Preview"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553 2.276a1 1 0 010 1.788L15 16.34M4 6h16M4 18h16M4 12h8"/></svg></button>
                  <button class="hover:text-gray-700" title="Options"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg></button>
                </div>
              </div>
            </div>

            <div class="text-sm text-gray-500" *ngIf="!lessons().length">No lessons yet. Create one to get started.</div>
          </div>
        </div>
      </div>

      <app-lesson-dialog
        [open]="showLessonDialog()"
        [title]="lessonDialogTitle"
        [model]="lessonDialogModel"
        (cancel)="closeLessonDialog()"
        (save)="handleLessonDialogSave($event)">
      </app-lesson-dialog>
    </div>
  `
})
export class AdminClassRoomOverviewComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  protected classroomId = '';

  classroom = signal<ClassroomSummary | null>(null);
  lessons = signal<LessonSummary[]>([]);
  members = signal<StudentSummary[]>([]);

  // Simple mock for tags
  technologies = ['HTML', 'CSS', 'JavaScript'];
  defaultDuration = 40;

  // Dialog state for create/edit lesson
  showLessonDialog = signal(false);
  lessonDialogModel: LessonDialogModel = { name: '', description: '', enabled: false };
  lessonDialogTitle = 'Create lesson';

  activeLessons = computed(() => this.lessons().filter(l => l.enabled).length);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classroomFacade: ClassroomManagementFacade,
    private lessonFacade: LessonManagementFacade,
    private classroomService: ClassroomService,
    private userStore: UserStoreService,
  ) {}

  ngOnInit(): void {
    this.sub.add(this.route.paramMap.subscribe(async params => {
      const id = params.get('classRoomId');
      if (!id) return;
      this.classroomId = id;

      const c = await this.classroomFacade.getClassroom(id);
      this.classroom.set(c);

      const lessons = await this.lessonFacade.loadLessonsForClassroom(id);
      this.lessons.set(lessons);

      try {
        const members = await this.classroomService.getClassroomMembers(id);
        const mapped: StudentSummary[] = (members || []).map(m => ({
          userId: m.userId as string,
          displayName: (m as any).displayName || (m.userId as string),
          status: 'Active'
        }));
        this.members.set(mapped);
      } catch {
        this.members.set([]);
      }
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  copyCode() {
    const code = this.classroom()?.code;
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
  }

  async addLesson() {
    // Open create dialog; actual save handled in handleLessonDialogSave
    this.lessonDialogTitle = 'Create lesson';
    this.lessonDialogModel = { name: 'New Lesson', description: 'Draft lesson', enabled: false };
    this.showLessonDialog.set(true);
  }

  closeLessonDialog() {
    this.showLessonDialog.set(false);
  }

  async handleLessonDialogSave(data: LessonDialogModel) {
    try {
      const classId = this.classroomId || this.classroom()?.id;
      const currentUser = this.userStore.getCurrentUser();
      if (!classId || !currentUser?.id) {
        console.warn('Missing classroom or user context for creating a lesson');
        return;
      }

      const created = await this.lessonFacade.createLesson(classId, {
        createdBy: currentUser.id,
        name: data.name,
        description: data.description,
        enabled: !!data.enabled,
      });

      // Persist context
      this.userStore.selectedClassId.set(classId);
      this.userStore.selectedLessonId.set(created.id);

      // Refresh local lessons list
      const lessons = await this.lessonFacade.loadLessonsForClassroom(classId);
      this.lessons.set(lessons);

      // Navigate to lesson route
      await this.router.navigate([
        '/',
        RouteConstants.Paths.admin,
        RouteConstants.Paths.classroom,
        classId,
        RouteConstants.Paths.lesson,
        created.id,
      ]);
    } catch (e) {
      console.error('Failed to add lesson from overview', e);
    } finally {
      this.closeLessonDialog();
    }
  }

  viewAllStudents() {
    // Placeholder: in future navigate to a dedicated students page
  }
}
