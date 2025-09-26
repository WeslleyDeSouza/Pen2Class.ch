import {Component, OnInit, OnDestroy, inject, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentClassroomFacade } from './facades/student-classroom.facade';
import { StudentClassroom } from './components/student-class-card.component';
import { RouteConstants } from '../../../app/route.constants';

@Component({
  selector: 'app-student-classroom',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6" *ngIf="classroom">
          <div class="flex items-center space-x-3">
            <button (click)="goBack()" class="flex items-center text-gray-600 hover:text-gray-800">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </button>
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <div class="text-xl font-semibold text-gray-900">{{ classroom.name }}</div>
              <div class="text-sm text-gray-500">{{ classroom.teacherName }}</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ classroom.status }}
            </span>
            <div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Student
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6" *ngIf="classroom">
          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Progress -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Progress</h3>

              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">Overall</span>
                  <span class="text-sm font-semibold text-gray-900">{{ getProgressPercentage() }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all" [style.width.%]="getProgressPercentage()"></div>
                </div>
              </div>

              <div class="flex items-center justify-between text-center">
                <div>
                  <div class="text-2xl font-bold text-green-600">{{ classroom.completedLessons }}</div>
                  <div class="text-xs text-gray-500">Completed</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ classroom.totalLessons }}</div>
                  <div class="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>

            <!-- Technologies -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Technologies</h3>
              <div class="space-y-2">
                <span
                  *ngFor="let tech of classroom.technologies"
                  class="inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2"
                  [ngClass]="{
                    'bg-orange-100 text-orange-700': tech === 'HTML',
                    'bg-blue-100 text-blue-700': tech === 'CSS',
                    'bg-yellow-100 text-yellow-700': tech === 'JavaScript',
                    'bg-green-100 text-green-700': tech === 'React',
                    'bg-gray-100 text-gray-700': !['HTML', 'CSS', 'JavaScript', 'React'].includes(tech)
                  }"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <!-- Next Lesson -->
            <div [hidden]="true" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6" *ngIf="nextLesson">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Next Lesson</h3>
              <div class="space-y-2">
                <div class="font-medium text-gray-900">{{ nextLesson.title }}</div>
                <div class="text-xs text-gray-500 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ nextLesson.scheduledDate }}
                </div>
              </div>
            </div>

            <!-- Exams -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Exams</h3>

              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Available</span>
                  <span class="text-lg font-bold text-gray-900">{{ exams.available }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Completed</span>
                  <span class="text-lg font-bold text-gray-900">{{ exams.completed }}</span>
                </div>
              </div>

              <button
                (click)="viewAllExams()"
                class="w-full text-blue-600 text-sm font-medium hover:text-blue-700">
                View All Exams
              </button>
            </div>
          </div>

          <!-- Lessons List -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Lessons</h2>
              </div>

              <div class="divide-y divide-gray-100">
                <div
                  *ngFor="let lesson of lessons"
                  class="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  (click)="openLesson(lesson)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <!-- Lesson Icon -->
                      <div class="p-2 rounded-lg" [ngClass]="getLessonIconClass(lesson.type)">
                        <svg class="w-5 h-5" [innerHTML]="getLessonIcon(lesson.type)"></svg>
                      </div>

                      <!-- Lesson Info -->
                      <div>
                        <div class="font-medium text-gray-900">{{ $any(lesson).name || lesson.title }}</div>
                        <div class="text-sm text-gray-500">{{ lesson.description }}</div>
                        <div class="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span class="flex items-center">
                            @if(lesson.duration){
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                              {{ lesson.duration }} min
                            }
                          </span>
                          <span>{{ lesson.type }}</span>
                          <span *ngIf="lesson.completedDate">Completed {{ lesson.completedDate }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Status Badge -->
                    <div class="flex items-center">
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getLessonStatusClass(lesson.status)"
                      >
                        <svg *ngIf="lesson.status === 'completed'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <svg *ngIf="lesson.status === 'active'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 0v8a2 2 0 002 2h8a2 2 0 002-2v-8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <svg *ngIf="lesson.status === 'locked'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        {{ lesson.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="!classroom" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div class="mt-4 text-gray-600">Loading classroom...</div>
        </div>
      </div>
    </div>
  `
})
export class StudentClassroomComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  classroom: StudentClassroom | null = null;
  classroomId = '';
  cdr = inject(ChangeDetectorRef);

  lessons: Lesson[] = [ ];

  nextLesson = {
    title: '',
    scheduledDate: ''
  };

  exams = {
    available: 1,
    completed: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentFacade: StudentClassroomFacade
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(async params => {
        const id = params.get(RouteConstants.Params.classRoomId);
        if (id) {
          this.classroomId = id;

          if(this.studentFacade.enrolledClassrooms()?.length === 0)
          await this.studentFacade.loadEnrolledClassrooms();

          this.classroom = await this.studentFacade.getClassroom(id);
          this.lessons = this.classroom?.lessons || [];
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/', RouteConstants.Paths.student]);
  }

  getProgressPercentage(): number {
    if (!this.classroom) return 0;
    return Math.round((this.classroom.completedLessons / this.classroom.totalLessons) * 100);
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'Video':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 0v8a2 2 0 002 2h8a2 2 0 002-2v-8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>';
      case 'Interactive':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>';
      case 'Reading':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>';
      default:
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';
    }
  }

  getLessonIconClass(type: string): string {
    switch (type) {
      case 'Video':
        return 'bg-green-100 text-green-600';
      case 'Interactive':
        return 'bg-blue-100 text-blue-600';
      case 'Reading':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getLessonStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  openLesson(lesson: Lesson): void {
    if (lesson.status !== 'locked') {
      // Navigate to the specific lesson
      this.router.navigate([
        '/',
        RouteConstants.Paths.student,
        RouteConstants.Paths.classroom,
        this.classroomId,
        RouteConstants.Paths.lesson,
        lesson.id
      ]);
    }
  }

  viewAllExams(): void {
    // Navigate to the exam overview page
    this.router.navigate([
      '/',
      RouteConstants.Paths.student,
      RouteConstants.Paths.classroom,
      this.classroomId,
      'exams'
    ]);
  }
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'Video' | 'Interactive' | 'Reading';
  status: 'completed' | 'active' | 'locked';
  completedDate?: string;
}
