import { Component, OnInit, OnDestroy } from '@angular/core';
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
        <div class="flex items-center space-x-3 mb-6">
          <button (click)="goBack()" class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
          <div *ngIf="classroom">
            <div class="text-sm text-gray-500">Student • Classroom</div>
            <div class="text-xl font-semibold text-gray-900">{{ classroom.name }}</div>
          </div>
        </div>

        <!-- Classroom Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" *ngIf="classroom">
          <!-- Main Content -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Course Overview</h2>
              <p class="text-gray-600 mb-6" *ngIf="classroom.description">{{ classroom.description }}</p>

              <!-- Progress -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Your Progress</span>
                  <span class="text-sm font-semibold text-gray-900">{{ classroom.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-blue-600 h-3 rounded-full transition-all"
                    [style.width.%]="classroom.progress"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ classroom.completedLessons }} of {{ classroom.totalLessons }} lessons completed
                </div>
              </div>

              <!-- Technologies -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Technologies</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    *ngFor="let tech of classroom.technologies"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
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

              <!-- Continue Button -->
              <button
                (click)="continueLesson()"
                class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                [disabled]="classroom.status === 'completed'"
              >
                {{ classroom.status === 'completed' ? 'Course Completed' : 'Continue Learning' }}
              </button>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <!-- Instructor Info -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Instructor</h3>
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">{{ classroom.teacherName.charAt(0) }}</span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ classroom.teacherName }}</div>
                  <div class="text-xs text-gray-500">Course Instructor</div>
                </div>
              </div>
            </div>

            <!-- Next Lesson -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6" *ngIf="classroom.nextLesson && classroom.status === 'active'">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Next Lesson</h3>
              <div class="space-y-2">
                <div class="font-medium text-gray-900">{{ classroom.nextLesson.title }}</div>
                <div class="text-xs text-gray-500 flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ classroom.nextLesson.scheduledDate }}
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentFacade: StudentClassroomFacade
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(async params => {
        const id = params.get('classroomId');
        if (id) {
          this.classroomId = id;
          this.classroom = await this.studentFacade.getClassroom(id);
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

  continueLesson(): void {
    if (this.classroom && this.classroom.status === 'active') {
      // Navigate to the next lesson
      this.router.navigate([
        '/',
        RouteConstants.Paths.student,
        RouteConstants.Paths.classroom,
        this.classroomId,
        RouteConstants.Paths.lesson,
        'next'
      ]);
    }
  }
}