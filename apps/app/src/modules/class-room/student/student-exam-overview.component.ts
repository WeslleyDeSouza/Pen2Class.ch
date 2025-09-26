import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentClassroomFacade } from './facades/student-classroom.facade';
import { StudentClassroom } from './components/student-class-card.component';
import { RouteConstants } from '../../../app/route.constants';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: number;
  dueDate: string;
  attempts: {
    current: number;
    max: number;
  };
  status: 'available' | 'upcoming' | 'completed';
  score?: number; // percentage for completed exams
  type: 'quiz' | 'midterm' | 'challenge';
}

@Component({
  selector: 'app-student-exam-overview',
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
              Back to Class
            </button>
            <div class="p-2 bg-orange-100 rounded-lg">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <div class="text-xl font-semibold text-gray-900">Exams</div>
              <div class="text-sm text-gray-500">{{ classroom.name }}</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">{{ exams.length }} exams</span>
            <div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Student
            </div>
          </div>
        </div>

        <!-- Exams List -->
        <div class="space-y-6" *ngIf="classroom">
          <div
            *ngFor="let exam of exams"
            class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <!-- Exam Icon -->
                  <div class="p-3 rounded-lg" [ngClass]="getExamIconClass(exam.type)">
                    <svg class="w-6 h-6" [innerHTML]="getExamIcon(exam.type)"></svg>
                  </div>

                  <!-- Exam Info -->
                  <div>
                    <div class="font-semibold text-lg text-gray-900">{{ exam.title }}</div>
                    <div class="text-sm text-gray-600 mb-2">{{ exam.description }}</div>
                    <div class="flex items-center space-x-6 text-sm text-gray-500">
                      <!-- Duration -->
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {{ exam.duration }} min
                      </span>
                      <!-- Questions -->
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        {{ exam.questions }} questions
                      </span>
                      <!-- Due Date -->
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Due: {{ exam.dueDate }}
                      </span>
                      <!-- Attempts -->
                      <span>Attempts: {{ exam.attempts.current }}/{{ exam.attempts.max }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right Side: Status and Action -->
                <div class="flex items-center space-x-4">
                  <!-- Score (for completed exams) -->
                  <div *ngIf="exam.status === 'completed' && exam.score !== undefined" class="text-right">
                    <div class="text-lg font-bold text-blue-600">{{ exam.score }}%</div>
                  </div>

                  <!-- Status Badge -->
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="getExamStatusClass(exam.status)"
                  >
                    {{ getExamStatusText(exam.status) }}
                  </span>

                  <!-- Action Button -->
                  <button
                    (click)="handleExamAction(exam)"
                    class="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    [ngClass]="getExamButtonClass(exam.status)"
                    [disabled]="exam.status === 'upcoming'"
                  >
                    {{ getExamButtonText(exam.status) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="exams.length === 0" class="text-center py-12">
          <div class="mb-4">
            <svg class="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
          <p class="text-gray-600">Check back later for upcoming exams and quizzes</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="!classroom" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <div class="mt-4 text-gray-600">Loading exams...</div>
        </div>
      </div>
    </div>
  `
})
export class StudentExamOverviewComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  classroom: StudentClassroom | null = null;
  classroomId = '';
  cdr = inject(ChangeDetectorRef);

  // Mock exam data - in a real app this would come from a service
  exams: Exam[] = [
    {
      id: '1',
      title: 'HTML & CSS Fundamentals Quiz',
      description: 'Test your knowledge of HTML structure and CSS styling basics',
      duration: 30,
      questions: 15,
      dueDate: '2025-01-15',
      attempts: { current: 0, max: 2 },
      status: 'available',
      type: 'quiz'
    },
    {
      id: '2',
      title: 'Midterm Exam',
      description: 'Comprehensive exam covering HTML, CSS, and basic JavaScript',
      duration: 90,
      questions: 25,
      dueDate: '2025-01-20',
      attempts: { current: 0, max: 1 },
      status: 'upcoming',
      type: 'midterm'
    },
    {
      id: '3',
      title: 'CSS Layout Challenge',
      description: 'Practical exam testing your CSS layout skills',
      duration: 60,
      questions: 10,
      dueDate: '2025-01-10',
      attempts: { current: 1, max: 2 },
      status: 'completed',
      score: 85,
      type: 'challenge'
    }
  ];

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

          if (this.studentFacade.enrolledClassrooms()?.length === 0) {
            await this.studentFacade.loadEnrolledClassrooms();
          }

          this.classroom = await this.studentFacade.getClassroom(id);
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goBack(): void {
    this.router.navigate([
      '/',
      RouteConstants.Paths.student,
      RouteConstants.Paths.classroom,
      this.classroomId
    ]);
  }

  getExamIcon(type: string): string {
    switch (type) {
      case 'quiz':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>';
      case 'midterm':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';
      case 'challenge':
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>';
      default:
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>';
    }
  }

  getExamIconClass(type: string): string {
    switch (type) {
      case 'quiz':
        return 'bg-orange-100 text-orange-600';
      case 'midterm':
        return 'bg-gray-100 text-gray-600';
      case 'challenge':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  getExamStatusClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-orange-100 text-orange-800';
      case 'upcoming':
        return 'bg-gray-100 text-gray-600';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getExamStatusText(status: string): string {
    switch (status) {
      case 'available':
        return 'available';
      case 'upcoming':
        return 'upcoming';
      case 'completed':
        return 'completed';
      default:
        return status;
    }
  }

  getExamButtonClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-orange-600 text-white hover:bg-orange-700';
      case 'upcoming':
        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
      case 'completed':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      default:
        return 'bg-gray-300 text-gray-500';
    }
  }

  getExamButtonText(status: string): string {
    switch (status) {
      case 'available':
        return 'Start Exam';
      case 'upcoming':
        return 'upcoming';
      case 'completed':
        return 'Review';
      default:
        return 'View';
    }
  }

  handleExamAction(exam: Exam): void {
    if (exam.status === 'upcoming') return;

    if (exam.status === 'available') {
      // Navigate to start exam
      this.router.navigate([
        '/',
        RouteConstants.Paths.student,
        RouteConstants.Paths.classroom,
        this.classroomId,
        'exam',
        exam.id,
        'start'
      ]);
    } else if (exam.status === 'completed') {
      // Navigate to review exam
      this.router.navigate([
        '/',
        RouteConstants.Paths.student,
        RouteConstants.Paths.classroom,
        this.classroomId,
        'exam',
        exam.id,
        'review'
      ]);
    }
  }
}