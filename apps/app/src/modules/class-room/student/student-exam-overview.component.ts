import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {firstValueFrom, Subscription} from 'rxjs';
import { StudentClassroomFacade } from './facades/student-classroom.facade';
import { StudentClassroom } from './components/student-class-card.component';
import { ExamsManagementFacade, ExamSummary } from '../teacher/facades/exams-management-facade.service';
import { RouteConstants } from '../../../app/route.constants';
import { prettify } from 'htmlfy';

interface ExamQuestion {
  question: string;
  options: string[];
  answer: string | string[]; // Can be single answer or multiple correct answers
}

interface ExamStep {
  step: string;
  content: string;
  questions: ExamQuestion[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

interface QuizState {
  currentStepIndex: number;
  answers: { [key: string]: string }; // key format: "stepIndex_questionIndex"
  startTime: Date;
  timeRemaining?: number;
}

interface ExamSubmission {
  id: string;
  examId: string;
  userId: string;
  classroomId: string;
  answers: { [key: string]: string };
  startTime: Date;
  endTime: Date;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  submittedAt: Date;
}

interface ExamWithStatus extends ExamSummary {
  isSubmitted: boolean;
  submission?: ExamSubmission;
}

@Component({
  selector: 'app-student-exam-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6" *ngIf="!isInQuiz()">
          <div class="flex items-center space-x-3">
            <button (click)="goBack()" class="flex items-center text-gray-600 hover:text-gray-800">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Class
            </button>
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <div class="text-xl font-semibold text-gray-900">Exams</div>
              <div class="text-sm text-gray-500">{{ classroom?.name }}</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">{{ exams().length }} exams</span>
            <div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Student
            </div>
          </div>
        </div>

        <!-- Quiz Interface -->
        <div *ngIf="isInQuiz() && currentExam() && quizState()" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <!-- Quiz Header -->
          <div class="px-6 py-4 bg-purple-50 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ currentExam()?.name }}</h2>
                <div class="text-sm text-gray-600">{{ getCurrentStep()?.step }}</div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-600">
                  Section {{ quizState()!.currentStepIndex + 1 }} of {{ getParsedSteps().length }}
                </div>
                <button (click)="exitQuiz()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Quiz Content -->
          <div class="flex h-96">
            <!-- Main Content -->
            <div class="flex-1 p-6 overflow-y-auto">
              <div *ngIf="getCurrentStep(); else noSteps">
                <div class="text-gray-700 mb-6" [innerHTML]="formatContent(getCurrentStep()?.content || '')"></div>

                <!-- Questions -->
                <div *ngIf="getCurrentStep()?.questions && $any(getCurrentStep())?.questions?.length > 0" class="space-y-6">
                  <div
                    *ngFor="let question of getCurrentStep()?.questions; let i = index"
                    class="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 class="font-medium text-gray-900 mb-3">{{ i + 1 }}. {{ question.question }}</h4>

                    <div class="space-y-2">
                      <label
                        *ngFor="let option of question.options; let j = index"
                        class="flex items-start space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      >
                        <input
                          type="radio"
                          [name]="'question_' + quizState()!.currentStepIndex + '_' + i"
                          [value]="option"
                          [(ngModel)]="quizState()!.answers[quizState()!.currentStepIndex + '_' + i]"
                          class="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <span class="text-gray-700 flex-1">{{ option }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noSteps>
                <div class="text-center py-8">
                  <p class="text-gray-500">No exam content available.</p>
                </div>
              </ng-template>

              <!-- Navigation -->
              <div class="flex items-center justify-between pt-6 border-t mt-6" *ngIf="getParsedSteps().length > 0">
                <button
                  (click)="previousStep()"
                  [disabled]="quizState()!.currentStepIndex === 0"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>

                <div class="text-center">
                  <div class="text-sm text-gray-600">Section {{ quizState()!.currentStepIndex + 1 }} of {{ getParsedSteps().length }}</div>
                </div>

                <button
                  *ngIf="quizState()!.currentStepIndex < getParsedSteps().length - 1"
                  (click)="nextStep()"
                  class="flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Next
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>

                <button
                  *ngIf="quizState()!.currentStepIndex === getParsedSteps().length - 1"
                  (click)="submitQuiz()"
                  class="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Submit Quiz
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Exam Progress</h3>

              <div class="space-y-2" *ngIf="getParsedSteps().length > 0; else noSections">
                <div
                  *ngFor="let step of getParsedSteps(); let i = index"
                  (click)="setCurrentStep(i)"
                  class="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                  [ngClass]="i === quizState()!.currentStepIndex ? 'bg-purple-100 text-purple-800' : 'hover:bg-white'">

                  <div class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3"
                       [ngClass]="i === quizState()!.currentStepIndex ? 'bg-purple-600 text-white' : getSectionCompletionClass(i)">
                    {{ i + 1 }}
                  </div>

                  <div class="flex-1">
                    <div class="text-sm font-medium" [ngClass]="i === quizState()!.currentStepIndex ? 'text-purple-900' : 'text-gray-900'">
                      {{ step.step }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ getAnsweredCount(i) }}/{{ step.questions?.length || 0 }} answered
                    </div>
                  </div>

                  <div *ngIf="i === quizState()!.currentStepIndex" class="w-2 h-2 rounded-full bg-purple-600"></div>
                </div>
              </div>

              <ng-template #noSections>
                <div class="text-center py-8">
                  <p class="text-sm text-gray-500">No sections available</p>
                </div>
              </ng-template>

              <!-- Submit Section -->
              <div class="mt-6 pt-6 border-t">
                <div class="text-sm text-gray-600 mb-2">
                  Total Progress: {{ getTotalAnsweredCount() }}/{{ getTotalQuestions() }}
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" [style.width.%]="getProgressPercentage()"></div>
                </div>
                <button
                  (click)="submitQuiz()"
                  [disabled]="!canSubmit()"
                  class="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Exams List -->
        <div *ngIf="!isInQuiz()" class="space-y-6">
          <div
            *ngFor="let exam of exams()"
            class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <!-- Exam Icon -->
                  <div class="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>

                  <!-- Exam Info -->
                  <div>
                    <div class="font-semibold text-lg text-gray-900">{{ exam.name }}</div>
                    <div class="text-sm text-gray-600 mb-2">{{ exam.description }}</div>
                    <div class="flex items-center space-x-6 text-sm text-gray-500">
                      <!-- Questions -->
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        {{ getExamQuestionCount(exam) }} questions
                      </span>
                      <!-- Status -->
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            [ngClass]="exam.isSubmitted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path *ngIf="exam.isSubmitted" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          <path *ngIf="!exam.isSubmitted" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                        </svg>
                        {{ exam.isSubmitted ? 'Submitted' : 'Available' }}
                      </span>
                      <!-- Updated -->
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Updated: {{ exam.updatedAt | date:'short' }}
                      </span>
                      <!-- Submission Date -->
                      <span *ngIf="exam.isSubmitted && exam.submission" class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Submitted: {{ exam.submission.submittedAt | date:'short' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Status and Action -->
                <div class="flex items-center space-x-4">
                  <!-- Score Display for Submitted Exams -->
                  <div *ngIf="exam.isSubmitted && exam.submission" class="text-right">
                    <div class="text-lg font-bold text-green-600">
                      {{ getSubmissionScore(exam.submission) }}%
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ exam.submission.answeredQuestions }}/{{ exam.submission.totalQuestions }} answered
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center space-x-2">
                    <button
                      *ngIf="!exam.isSubmitted"
                      (click)="startExam(exam)"
                      class="px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-purple-600 text-white hover:bg-purple-700"
                      [disabled]="getExamQuestionCount(exam) === 0"
                    >
                      Start Exam
                    </button>

                    <button
                      *ngIf="exam.isSubmitted"
                      (click)="viewExamResult(exam)"
                      class="px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-green-600 text-white hover:bg-green-700"
                    >
                      {{ showResultsFor()?.id === exam.id ? 'Hide Results' : 'View Results' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Results View -->
        <div *ngIf="showResultsFor() as exam" class="mb-6">
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <!-- Results Header -->
            <div class="px-6 py-4 bg-blue-50 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ exam.name }} - Results Review</h3>
                  <div class="text-sm text-gray-600">
                    Score: {{ getSubmissionScore(exam.submission!) }}%
                    ({{ exam.submission?.correctAnswers }}/{{ exam.submission?.totalQuestions }} correct)
                  </div>
                </div>
                <button (click)="showResultsFor.set(null)"
                        class="text-gray-400 hover:text-gray-600 transition-colors p-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Questions List -->
            <div class="p-6">
              <div class="space-y-6">
                <div *ngFor="let result of getAllQuestionResults(exam); let i = index"
                     class="border border-gray-200 rounded-lg p-4"
                     [class.bg-green-50]="result.isCorrect"
                     [class.bg-red-50]="!result.isCorrect">

                  <!-- Question Header -->
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium text-gray-600">Question {{ i + 1 }}</span>
                      <span class="text-xs text-gray-500">{{ result.stepTitle }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg *ngIf="result.isCorrect" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <svg *ngIf="!result.isCorrect" class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="text-sm font-medium"
                            [class.text-green-600]="result.isCorrect"
                            [class.text-red-600]="!result.isCorrect">
                        {{ result.isCorrect ? 'Correct' : 'Incorrect' }}
                      </span>
                    </div>
                  </div>

                  <!-- Question Text -->
                  <div class="mb-4">
                    <p class="text-gray-900 font-medium">{{ result.question.question }}</p>
                  </div>

                  <!-- Answer Options -->
                  <div class="space-y-2">
                    <div *ngFor="let option of result.question.options"
                         class="flex items-center space-x-2 p-2 rounded"
                         [class.bg-green-100]="isCorrectOption(result, option)"
                         [class.bg-red-100]="isUserSelectedIncorrect(result, option)"
                         [class.bg-blue-100]="isUserSelectedCorrect(result, option)">
                      <div class="w-4 h-4 flex-shrink-0">
                        <!-- Correct answer indicator -->
                        <svg *ngIf="isCorrectOption(result, option)" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <!-- User's incorrect selection -->
                        <svg *ngIf="isUserSelectedIncorrect(result, option)" class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <span class="text-sm"
                            [class.font-medium]="isCorrectOption(result, option) || option === result.userAnswer">
                        {{ option }}
                      </span>
                      <!-- Labels -->
                      <span *ngIf="isCorrectOption(result, option)" class="text-xs text-green-600 font-medium ml-auto">
                        Correct Answer
                      </span>
                      <span *ngIf="isUserSelectedIncorrect(result, option)" class="text-xs text-red-600 font-medium ml-auto">
                        Your Answer
                      </span>
                      <span *ngIf="isUserSelectedCorrect(result, option)" class="text-xs text-blue-600 font-medium ml-auto">
                        Your Answer (Correct)
                      </span>
                    </div>
                  </div>

                  <!-- No Answer Provided -->
                  <div *ngIf="!result.userAnswer" class="mt-3 p-2 bg-yellow-50 rounded">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="text-sm text-yellow-700">No answer provided</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isInQuiz() && exams().length === 0" class="text-center py-12">
          <div class="mb-4">
            <svg class="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
          <p class="text-gray-600">Check back later for upcoming exams and quizzes</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="!isInQuiz() && !classroom && isLoading()" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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

  // Reactive signals
  exams = signal<ExamWithStatus[]>([]);
  isLoading = signal<boolean>(true);
  currentExam = signal<ExamWithStatus | null>(null);
  quizState = signal<QuizState | null>(null);
  submissions = signal<ExamSubmission[]>([]);
  showResultsFor = signal<ExamWithStatus | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentFacade: StudentClassroomFacade,
    private examsFacade: ExamsManagementFacade
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(async params => {
        const id = params.get(RouteConstants.Params.classRoomId);

        if (id) {
          this.classroomId = id;
          this.isLoading.set(true);

          // Load classroom info
          if (this.studentFacade.enrolledClassrooms()?.length === 0) {
            await this.studentFacade.loadEnrolledClassrooms();
          }
          this.classroom = await this.studentFacade.getClassroom(id);

          // Load exams and submissions
          await this.loadExamsWithStatus(id);
          this.isLoading.set(false);
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

  isInQuiz(): boolean {
    return !!this.quizState();
  }

  async loadExamsWithStatus(classroomId: string): Promise<void> {
    try {
      // Load exams
      const exams = await this.examsFacade.getExams(classroomId);

      // Load user submissions
      const submissionsData = await this.examsFacade.getUsersSubmitedResult( classroomId);

      // Parse submissions (assuming the API returns an array or we need to extract from response)
      const submissions: ExamSubmission[] = this.parseSubmissions(submissionsData);
      this.submissions.set(submissions);
      console.log('submissions', submissions);

      // Merge exams with submission status
      const examsWithStatus: ExamWithStatus[] = exams.map(exam => {
        const submission = submissions.find(sub => sub.examId === exam.id);
        return {
          ...exam,
          isSubmitted: !!submission,
          submission
        };
      });

      this.exams.set(examsWithStatus);
    } catch (error) {
      console.error('Failed to load exams with status:', error);
      // Fallback to just loading exams without submission status
      const exams = await this.examsFacade.getExams(classroomId);
      const examsWithStatus: ExamWithStatus[] = exams.map(exam => ({
        ...exam,
        isSubmitted: false
      }));
      this.exams.set(examsWithStatus);
    }
  }

  private parseSubmissions(submissionsData: any): ExamSubmission[] {
    try {
      // Handle different response formats from the API
      if (Array.isArray(submissionsData)) {
        return submissionsData.map(this.mapSubmissionData);
      } else if (submissionsData?.data && Array.isArray(submissionsData.data)) {
        return submissionsData.data.map(this.mapSubmissionData);
      }
      return [];
    } catch (error) {
      console.error('Failed to parse submissions:', error);
      return [];
    }
  }

  private mapSubmissionData(item: any): ExamSubmission {
    const data = item.data || item;
    return {
      id: item.id || '',
      examId: data.examId || '',
      userId: item.userId || data.userId || '',
      classroomId: item.classroomId || data.classroomId || '',
      answers: data.answers || {},
      startTime: new Date(data.startTime || Date.now()),
      endTime: new Date(data.endTime || Date.now()),
      totalQuestions: data.totalQuestions || 0,
      answeredQuestions: data.answeredQuestions || 0,
      correctAnswers: data.correctAnswers || 0,
      submittedAt: new Date(item.createdAt || data.submittedAt || Date.now())
    };
  }

  getExamQuestionCount(exam: ExamWithStatus): number {
    try {
      const config = typeof exam.configuration === 'string'
        ? JSON.parse(exam.configuration)
        : exam.configuration;

      if (!Array.isArray(config)) return 0;

      return config.reduce((total, section) => {
        return total + (section.questions?.length || 0);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  startExam(exam: ExamWithStatus): void {
    if (exam.isSubmitted) {
      alert('This exam has already been submitted. You cannot retake it.');
      return;
    }

    if (this.getExamQuestionCount(exam) === 0) {
      alert('This exam has no questions available.');
      return;
    }

    this.currentExam.set(exam);
    this.quizState.set({
      currentStepIndex: 0,
      answers: {},
      startTime: new Date()
    });
  }

  getSubmissionScore(submission: ExamSubmission): number {
    if (submission.totalQuestions === 0) return 0;
    return Math.round((submission.correctAnswers / submission.totalQuestions) * 100);
  }

  viewExamResult(exam: ExamWithStatus): void {
    if (!exam.submission) {
      alert('No submission found for this exam.');
      return;
    }
    // Toggle the results view
    const current = this.showResultsFor();
    if (current?.id === exam.id) {
      this.showResultsFor.set(null); // Close if already open
    } else {
      this.showResultsFor.set(exam); // Open results for this exam
    }
  }

  getQuestionResult(exam: ExamWithStatus, stepIndex: number, questionIndex: number): {
    question: ExamQuestion;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
  } | null {
    if (!exam.submission || !exam.configuration) return null;

    const steps = Array.isArray(exam.configuration) ? exam.configuration : [];
    const step = steps[stepIndex];
    if (!step || !step.questions) return null;

    const question = step.questions[questionIndex];
    if (!question) return null;

    const answerKey = `${stepIndex}_${questionIndex}`;
    const userAnswer = exam.submission.answers[answerKey] || '';
    const correctAnswer = question.answer;

    // Check if answer is correct
    let isCorrect = false;
    if (Array.isArray(correctAnswer)) {
      isCorrect = correctAnswer.includes(userAnswer);
    } else {
      isCorrect = userAnswer === correctAnswer;
    }

    return {
      question,
      userAnswer,
      correctAnswer,
      isCorrect
    };
  }

  getAllQuestionResults(exam: ExamWithStatus): any[] {
    if (!exam.submission || !exam.configuration) return [];

    const steps = Array.isArray(exam.configuration) ? exam.configuration : [];
    const results: any[] = [];

    steps.forEach((step: any, stepIndex: number) => {
      if (step.questions) {
        step.questions.forEach((question: ExamQuestion, questionIndex: number) => {
          const result = this.getQuestionResult(exam, stepIndex, questionIndex);
          if (result) {
            results.push({
              ...result,
              stepIndex,
              questionIndex,
              stepTitle: step.step
            });
          }
        });
      }
    });

    return results;
  }

  isCorrectOption(result: any, option: string): boolean {
    const correctAnswer = result.correctAnswer;
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(option);
    }
    return option === correctAnswer;
  }

  isUserSelectedIncorrect(result: any, option: string): boolean {
    return option === result.userAnswer && !result.isCorrect;
  }

  isUserSelectedCorrect(result: any, option: string): boolean {
    return option === result.userAnswer && result.isCorrect;
  }

  exitQuiz(): void {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      this.currentExam.set(null);
      this.quizState.set(null);
    }
  }

  getParsedSteps(): ExamStep[] {
    const exam = this.currentExam();
    if (!exam?.configuration) return [];

    try {
      const config = typeof exam.configuration === 'string'
        ? JSON.parse(exam.configuration)
        : exam.configuration;

      return Array.isArray(config) ? config : [];
    } catch (e) {
      return [];
    }
  }

  getCurrentStep(): ExamStep | null {
    const steps = this.getParsedSteps();
    const state = this.quizState();
    if (!state || !steps.length) return null;

    return steps[state.currentStepIndex] || null;
  }

  setCurrentStep(index: number): void {
    const steps = this.getParsedSteps();
    const state = this.quizState();
    if (!state || index < 0 || index >= steps.length) return;

    this.quizState.update(state => ({
      ...state!,
      currentStepIndex: index
    }));
  }

  nextStep(): void {
    const steps = this.getParsedSteps();
    const state = this.quizState();
    if (!state || state.currentStepIndex >= steps.length - 1) return;

    this.quizState.update(state => ({
      ...state!,
      currentStepIndex: state!.currentStepIndex + 1
    }));
  }

  previousStep(): void {
    const state = this.quizState();
    if (!state || state.currentStepIndex <= 0) return;

    this.quizState.update(state => ({
      ...state!,
      currentStepIndex: state!.currentStepIndex - 1
    }));
  }

  formatContent(content: string): string {
    if (!content) return '';
    return prettify(content, { ignore: ['style'] })
      .replace('. ', '.')
      .replace(/\. /g, ".");
  }

  getAnsweredCount(stepIndex: number): number {
    const state = this.quizState();
    const steps = this.getParsedSteps();
    if (!state || !steps[stepIndex]) return 0;

    const step = steps[stepIndex];
    const questionCount = step.questions?.length || 0;
    let answered = 0;

    for (let i = 0; i < questionCount; i++) {
      const key = `${stepIndex}_${i}`;
      if (state.answers[key]) {
        answered++;
      }
    }

    return answered;
  }

  getSectionCompletionClass(stepIndex: number): string {
    const steps = this.getParsedSteps();
    if (!steps[stepIndex]) return 'bg-gray-100 text-gray-600';

    const questionCount = steps[stepIndex].questions?.length || 0;
    const answeredCount = this.getAnsweredCount(stepIndex);

    if (answeredCount === 0) return 'bg-gray-100 text-gray-600';
    if (answeredCount === questionCount) return 'bg-green-100 text-green-600';
    return 'bg-yellow-100 text-yellow-600';
  }

  getTotalAnsweredCount(): number {
    const steps = this.getParsedSteps();
    let total = 0;

    for (let i = 0; i < steps.length; i++) {
      total += this.getAnsweredCount(i);
    }

    return total;
  }

  getTotalQuestions(): number {
    const steps = this.getParsedSteps();
    return steps.reduce((total, step) => total + (step.questions?.length || 0), 0);
  }

  getProgressPercentage(): number {
    const total = this.getTotalQuestions();
    if (total === 0) return 0;

    const answered = this.getTotalAnsweredCount();
    return Math.round((answered / total) * 100);
  }

  getTotalAnsweredCorrectCount(): number {
    const steps = this.getParsedSteps();
    const state = this.quizState();
    if (!state) return 0;

    let correctCount = 0;

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      const questions = step.questions || [];

      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const question = questions[questionIndex];
        const key = `${stepIndex}_${questionIndex}`;
        const userAnswer = state.answers[key];

        if (!userAnswer) continue; // Skip unanswered questions

        const correctAnswer = question.answer;

        // Handle both string and array answer types
        if (Array.isArray(correctAnswer)) {
          // Multiple correct answers - check if user answer is in the array
          if (correctAnswer.includes(userAnswer)) {
            correctCount++;
          }
        } else {
          // Single correct answer - direct string comparison
          if (userAnswer === correctAnswer) {
            correctCount++;
          }
        }
      }
    }

    return correctCount;
  }

  canSubmit(): boolean {
    return this.getTotalAnsweredCount() > 0;
  }

  async submitQuiz(): Promise<void> {
    const state = this.quizState();
    const exam = this.currentExam();

    if (!state || !exam) return;

    if (!confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) {
      return;
    }

    try {
      const submissionData = {
        examId: exam.id,
        answers: state.answers,
        startTime: state.startTime,
        endTime: new Date(),
        totalQuestions: this.getTotalQuestions(),
        answeredQuestions: this.getTotalAnsweredCount(),
        correctAnswers:this.getTotalAnsweredCorrectCount(),
      };

      await (this.examsFacade.submitResult(this.classroomId, submissionData));

      alert('Exam submitted successfully!');
      this.currentExam.set(null);
      this.quizState.set(null);

      // Refresh exams list with updated submission status
      await this.loadExamsWithStatus(this.classroomId);

    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  }
}
