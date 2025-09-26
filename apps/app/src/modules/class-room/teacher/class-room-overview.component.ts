import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LessonDialogComponent, LessonDialogModel } from './components/lesson-dialog.component';
import { ClassroomDialogComponent, ClassroomDialogModel } from './components/classroom-dialog.component';
import { LessonEntryItemComponent } from './components/lesson-entry-item.component';
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
  imports: [CommonModule, LessonDialogComponent, ClassroomDialogComponent, LessonEntryItemComponent],
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
            <div id="classroom-card" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <div class="text-sm text-gray-600">{{ classroom()?.name || 'Classroom' }}</div>
                    <button (click)="editClassroom()" class="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Edit classroom">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="text-sm text-gray-600 mt-1">Access Code</div>
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
            <div  class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div class="text-gray-900 font-medium mb-3">Enabled Technologies</div>
              <div class="flex flex-wrap gap-2">
                <span *ngIf="classroom()?.configuration?.enabledTechnologies?.html!==false" class="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">HTML</span>
                <span *ngIf="classroom()?.configuration?.enabledTechnologies?.css!==false" class="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">CSS</span>
                <span *ngIf="classroom()?.configuration?.enabledTechnologies?.javascript!==false" class="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">JavaScript</span>
                <span *ngIf="!hasEnabledTechnologies()" class="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">No technologies enabled</span>
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

            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
              <app-lesson-item
                *ngFor="let l of lessons()"
                [lesson]="l"
                [classroomId]="classroomId"
                [studentsCount]="members().length"
                [activitiesCount]="0"
                (edit)="editLesson($event)"
                (delete)="deleteLesson($event)">
              </app-lesson-item>
            </div>

            <div class="text-sm text-gray-500 text-center py-8" *ngIf="!lessons().length">No lessons yet. Create one to get started.</div>
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

      <app-classroom-dialog
        [open]="showClassroomDialog()"
        [title]="classroomDialogTitle"
        [model]="classroomDialogModel"
        (cancel)="closeClassroomDialog()"
        (save)="handleClassroomDialogSave($event)">
      </app-classroom-dialog>
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
  editingLessonId: string | null = null;

  // Dialog state for edit classroom
  showClassroomDialog = signal(false);
  classroomDialogModel: ClassroomDialogModel = {
    name: '',
    enabled: true,
    configuration: {
      enabledTechnologies: {
        html: true,
        css: true,
        javascript: true
      }
    }
  };
  classroomDialogTitle = 'Edit Classroom';

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

  hasEnabledTechnologies(): boolean {
    const config = this.classroom()?.configuration?.enabledTechnologies;
    return !!(config?.html || config?.css || config?.javascript);
  }

  async addLesson() {
    // Open create dialog; actual save handled in handleLessonDialogSave
    this.lessonDialogTitle = 'Create lesson';
    this.lessonDialogModel = { name: '', description: '', enabled: true };
    this.editingLessonId = null;
    this.showLessonDialog.set(true);
  }

  editLesson(lesson: LessonSummary) {
    this.lessonDialogTitle = 'Edit lesson';
    this.lessonDialogModel = {
      ...lesson,
      name: lesson.name,
      description: lesson.description || '',
      enabled: lesson.enabled,
      configuration: (()=> {
        try {
         return typeof lesson.configuration == 'object' ? JSON.stringify(lesson.configuration):lesson.configuration
        }catch (e){
          console.log(e);
        }
        return ''
      })()
    };
    this.editingLessonId = lesson.id;

    this.showLessonDialog.set(true);
  }

  async deleteLesson(lesson: LessonSummary) {
    if (!confirm(`Are you sure you want to delete lesson "${lesson.name}"?`)) {
      return;
    }

    try {
      const classId = this.classroomId || this.classroom()?.id;
      const currentUser = this.userStore.getCurrentUser();
      if (!classId || !currentUser?.id) return;

      await this.lessonFacade.deleteLesson(classId, lesson.id, currentUser.id);

      // Refresh local lessons list
      const lessons = await this.lessonFacade.loadLessonsForClassroom(classId);
      this.lessons.set(lessons);
    } catch (e) {
      console.error('Failed to delete lesson', e);
    }
  }

  closeLessonDialog() {
    this.showLessonDialog.set(false);
    this.editingLessonId = null;
  }

  async handleLessonDialogSave(data: LessonDialogModel) {
    try {
      const classId = this.classroomId || this.classroom()?.id;
      const currentUser = this.userStore.getCurrentUser();
      if (!classId || !currentUser?.id) {
        console.warn('Missing classroom or user context for creating a lesson');
        return;
      }

      if (this.editingLessonId) {
        // Update existing lesson
        const updated = await this.lessonFacade.updateLesson(classId, this.editingLessonId, {
          name: data.name,
          description: data.description,
          enabled: !!data.enabled,
          configuration:  typeof data.configuration === 'string' ? JSON.parse(data.configuration) : data.configuration ,

        });

        // Refresh local lessons list
        const lessons = await this.lessonFacade.loadLessonsForClassroom(classId);
        this.lessons.set(lessons);
      } else {
        // Create new lesson
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


      }
    } catch (e) {
      console.error('Failed to save lesson from overview', e);
    } finally {
      this.closeLessonDialog();
    }
  }

  editClassroom() {
    const currentClassroom = this.classroom();
    if (!currentClassroom) return;

    this.classroomDialogModel = {
      name: currentClassroom.name,
      description: currentClassroom.description || '',
      enabled: true,
      configuration: {
        enabledTechnologies: {
          html: currentClassroom.configuration?.enabledTechnologies?.html ?? true,
          css: currentClassroom.configuration?.enabledTechnologies?.css ?? true,
          javascript: currentClassroom.configuration?.enabledTechnologies?.javascript ?? true
        }
      }
    };
    this.showClassroomDialog.set(true);
  }

  closeClassroomDialog() {
    this.showClassroomDialog.set(false);
  }

  async handleClassroomDialogSave(data: ClassroomDialogModel) {
    try {
      const classId = this.classroomId || this.classroom()?.id;
      if (!classId) return;

      const updated = await this.classroomFacade.updateClassroom(
        classId,
        data.name,
        data.description,
        data.configuration
      );

      if (updated) {
        this.classroom.set(updated);
      }
    } catch (e) {
      console.error('Failed to update classroom', e);
    } finally {
      this.closeClassroomDialog();
    }
  }

  viewAllStudents() {
    // Placeholder: in future navigate to a dedicated students page
  }
}
