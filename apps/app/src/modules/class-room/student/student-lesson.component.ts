import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentClassroomFacade } from './facades/student-classroom.facade';
import { RouteConstants } from '../../../app/route.constants';
import {LessonService} from "../../../common/services/lesson.service";
import {UserStoreService} from "../../../common/store";

@Component({
  selector: 'app-student-lesson',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <button (click)="goBack()"
                    class="inline-flex items-center px-3 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm">
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
            <div class="text-sm text-gray-500">Lesson {{ currentStepNumber }} of {{ totalSteps }}</div>
          </div>

          <div>
            <button
              (click)="toggleEditor()"
              class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-colors"

            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              {{ showEditor ? 'Hide Editor' : 'Show Editor' }}
            </button>
          </div>
        </div>

        <!-- Editor Sidebar -->
        <div *ngIf="showEditor" class="w-full h-screen bg-white border border-gray-200 shadow-lg mb-6">
          <router-outlet></router-outlet>
        </div>

        <!-- Content Area with Sidebar -->
        <div class="flex gap-6">
          <!-- Main Content -->
          <div class="flex-1">
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <!-- Lesson Content Area -->
              <div class="p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ lessonTitle }}</h2>

                <!-- Lesson content -->
                <div class="prose max-w-none">
                  <div *ngIf="getCurrentStep(); else noSteps">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">{{ getCurrentStep()?.step }}</h2>

                    <div class="text-gray-700 mb-6" [innerHTML]="formatContent($any(getCurrentStep())?.content)"></div>

                    <div *ngIf="getCurrentStep()?.sampleCodeExercise" class="mb-6">
                      <h3 class="text-sm font-semibold text-gray-900 mb-2">Sample Code Exercise</h3>
                      <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div [innerHTML]="formatContent($any(getCurrentStep())?.sampleCodeExercise)"></div>
                      </div>
                    </div>
                  </div>

                  <ng-template #noSteps>
                    <div class="text-center text-gray-500 py-8">
                      <p>No lesson content available.</p>
                    </div>
                  </ng-template>
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
                    <div class="text-sm text-gray-600">Lesson {{ currentStepNumber }} of {{ totalSteps }}</div>
                  </div>

                  <button
                    (click)="nextLesson()"
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

          <!-- Sidebar Course Lessons -->
          <div class="w-80">
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Course Lessons</h3>
              <div class="space-y-2">
                <div
                  *ngFor="let lesson of steps; let i = index"
                  class="flex items-center p-2 rounded-lg transition-colors cursor-pointer"
                  [class.bg-blue-50]="i + 1 === currentStepNumber"
                  [class.hover:bg-gray-50]="i + 1 !== currentStepNumber"
                  (click)="goToLesson(i + 1)"
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3"
                    [class.bg-blue-600]="lesson.completed"
                    [class.text-white]="lesson.completed"
                    [class.bg-blue-100]="i + 1 === currentStepNumber && !lesson.completed"
                    [class.text-blue-600]="i + 1 === currentStepNumber && !lesson.completed"
                    [class.bg-gray-100]="i + 1 !== currentStepNumber && !lesson.completed"
                    [class.text-gray-600]="i + 1 !== currentStepNumber && !lesson.completed"
                  >
                    <svg *ngIf="lesson.completed" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <span *ngIf="!lesson.completed">{{ i + 1 }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ lesson.step }}</div>
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
  lessonTitle = '';
  progress = 0;
  currentStepNumber = 1
  totalSteps = 0;

  hasPrevious = true;
  hasNext = true;
  showEditor = false;

  // Mock lesson data
  steps:any = [

  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userStore: UserStoreService,
    private studentFacade: StudentClassroomFacade,
    private lessonFacade: LessonService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(params => {
        this.classroomId = params.get(RouteConstants.Params.classRoomId) || '';
        this.lessonId = params.get(RouteConstants.Params.lessonId) || '';

        // In a real app, this would load the specific lesson
        this.loadLesson();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private loadLesson(): void {

    this.lessonFacade.get(
      this.classroomId,
      this.lessonId,
    ).then((lesson:any) => {

      this.userStore.selectedLessonId.set(this.lessonId);
      this.userStore.selectedClassId.set(this.classroomId);

      this.totalSteps = lesson.configuration?.length
      this.steps = lesson.configuration || [];
      this.loadStep()
    })
  }

  goBack(): void {
    this.router.navigate([
      '../../',

    ],{relativeTo: this.route});
  }

  previousLesson(): void {
    if (this.hasPrevious) {
      this.currentStepNumber--;
      this.loadStep();
      // In a real app, this would navigate to the previous lesson
    }
  }

  loadStep(){
    const step = this.steps[this.currentStepNumber - 1];;

     this.hasPrevious = this.currentStepNumber > 1;
    this.hasNext = this.currentStepNumber < this.totalSteps;
  }

  getCurrentStep(): any {
    return this.steps[this.currentStepNumber - 1];
  }

  formatContent(content: string): string {
    if (!content) return '';
    // Basic HTML formatting - replace newlines with <br> tags
    return content.replace(/\n/g, '<br>');
  }

  nextLesson(): void {
    if (this.hasNext) {
      this.currentStepNumber++;
      this.loadStep();
      // In a real app, this would navigate to the next lesson
      // and potentially update progress in the facade
      this.studentFacade.updateClassroomProgress(this.classroomId, this.currentStepNumber - 1);
    } else {
      // Course completed
      this.completeCourse();
    }
  }

  goToLesson(lessonNumber: number): void {
    this.currentStepNumber = lessonNumber;
    this.loadStep();
    // In a real app, this would navigate to the specific lesson
  }

  private completeCourse(): void {
    // Mark course as completed
    this.studentFacade.updateClassroomProgress(this.classroomId, this.totalSteps);

    // Navigate back to classroom with completion message
    this.router.navigate([
      '/',
      RouteConstants.Paths.student,
      RouteConstants.Paths.classroom,
      this.classroomId
    ]);
  }

  toggleEditor(): void {
    this.showEditor = !this.showEditor;
  }
}
