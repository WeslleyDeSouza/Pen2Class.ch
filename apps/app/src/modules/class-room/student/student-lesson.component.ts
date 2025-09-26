import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentClassroomFacade } from './facades/student-classroom.facade';
import { RouteConstants } from '../../../app/route.constants';

@Component({
  selector: 'app-student-lesson',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <button (click)="goBack()" class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Classroom
            </button>
            <div>
              <div class="text-sm text-gray-500">Student • Lesson</div>
              <div class="text-xl font-semibold text-gray-900">{{ lessonTitle }}</div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="text-sm text-gray-500">Lesson {{ currentLessonNumber }} of {{ totalLessons }}</div>
          </div>
        </div>

        <!-- Lesson Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <!-- Lesson Content Area -->
              <div class="p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ lessonTitle }}</h2>

                <!-- Placeholder for lesson content -->
                <div class="prose max-w-none">
                  <p class="text-gray-600 mb-4">
                    This is where the lesson content would be displayed. In a real implementation, this would include:
                  </p>
                  <ul class="text-gray-600 mb-6">
                    <li>Interactive tutorials</li>
                    <li>Code examples and exercises</li>
                    <li>Video content</li>
                    <li>Reading materials</li>
                    <li>Practice assignments</li>
                  </ul>

                  <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-medium text-gray-900 mb-2">Sample Code Exercise</h3>
                    <pre class="bg-gray-900 text-white p-4 rounded text-sm overflow-x-auto"><code>// Example CSS Flexbox layout
.container {{ '{' }}
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
{{ '}' }}

.item {{ '{' }}
  flex: 1;
  margin: 0 10px;
{{ '}' }}</code></pre>
                  </div>
                </div>
              </div>

              <!-- Lesson Actions -->
              <div class="border-t border-gray-200 p-6 bg-gray-50">
                <div class="flex items-center justify-between">
                  <button
                    (click)="previousLesson()"
                    [disabled]="!hasPrevious"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Previous
                  </button>

                  <div class="text-center">
                    <div class="text-sm text-gray-600">Lesson {{ currentLessonNumber }} of {{ totalLessons }}</div>
                  </div>

                  <button
                    (click)="nextLesson()"
                    [disabled]="!hasNext"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ hasNext ? 'Next' : 'Complete' }}
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <!-- Lesson Navigation -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Course Lessons</h3>
              <div class="space-y-2">
                <div
                  *ngFor="let lesson of lessons; let i = index"
                  class="flex items-center p-2 rounded-lg transition-colors cursor-pointer"
                  [class.bg-blue-50]="i + 1 === currentLessonNumber"
                  [class.hover:bg-gray-50]="i + 1 !== currentLessonNumber"
                  (click)="goToLesson(i + 1)"
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3"
                    [class.bg-blue-600]="lesson.completed"
                    [class.text-white]="lesson.completed"
                    [class.bg-blue-100]="i + 1 === currentLessonNumber && !lesson.completed"
                    [class.text-blue-600]="i + 1 === currentLessonNumber && !lesson.completed"
                    [class.bg-gray-100]="i + 1 !== currentLessonNumber && !lesson.completed"
                    [class.text-gray-600]="i + 1 !== currentLessonNumber && !lesson.completed"
                  >
                    <svg *ngIf="lesson.completed" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span *ngIf="!lesson.completed">{{ i + 1 }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ lesson.title }}</div>
                    <div class="text-xs text-gray-500">{{ lesson.duration }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentLessonComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  classroomId = '';
  lessonId = '';
  lessonTitle = 'CSS Flexbox Layout';
  progress = 65;
  currentLessonNumber = 7;
  totalLessons = 8;

  hasPrevious = true;
  hasNext = true;

  // Mock lesson data
  lessons = [
    { title: 'HTML Basics', duration: '30 min', completed: true },
    { title: 'CSS Fundamentals', duration: '45 min', completed: true },
    { title: 'CSS Selectors', duration: '40 min', completed: true },
    { title: 'CSS Box Model', duration: '35 min', completed: true },
    { title: 'CSS Positioning', duration: '50 min', completed: true },
    { title: 'CSS Grid Layout', duration: '60 min', completed: true },
    { title: 'CSS Flexbox Layout', duration: '55 min', completed: false },
    { title: 'Responsive Design', duration: '45 min', completed: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentFacade: StudentClassroomFacade
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(params => {
        this.classroomId = params.get('classroomId') || '';
        this.lessonId = params.get('lessonId') || '';

        // In a real app, this would load the specific lesson
        this.loadLesson();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadLesson(): void {
    // Mock implementation - in a real app, this would load the lesson content
    this.hasPrevious = this.currentLessonNumber > 1;
    this.hasNext = this.currentLessonNumber < this.totalLessons;
  }

  goBack(): void {
    this.router.navigate([
      '../../',

    ],{relativeTo: this.route});
  }

  previousLesson(): void {
    if (this.hasPrevious) {
      this.currentLessonNumber--;
      this.loadLesson();
      // In a real app, this would navigate to the previous lesson
    }
  }

  nextLesson(): void {
    if (this.hasNext) {
      this.currentLessonNumber++;
      this.loadLesson();
      // In a real app, this would navigate to the next lesson
      // and potentially update progress in the facade
      this.studentFacade.updateClassroomProgress(this.classroomId, this.currentLessonNumber - 1);
    } else {
      // Course completed
      this.completeCourse();
    }
  }

  goToLesson(lessonNumber: number): void {
    this.currentLessonNumber = lessonNumber;
    this.loadLesson();
    // In a real app, this would navigate to the specific lesson
  }

  private completeCourse(): void {
    // Mark course as completed
    this.studentFacade.updateClassroomProgress(this.classroomId, this.totalLessons);

    // Navigate back to classroom with completion message
    this.router.navigate([
      '/',
      RouteConstants.Paths.student,
      RouteConstants.Paths.classroom,
      this.classroomId
    ]);
  }
}
