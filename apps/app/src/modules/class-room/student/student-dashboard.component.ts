import {Component, OnDestroy, OnInit, computed, signal, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteConstants } from '../../../app/route.constants';
import { StudentClassCardComponent, StudentClassroom } from './components/student-class-card.component';
import { StudentClassroomFacade, StudentStats } from './facades/student-classroom.facade';



@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentClassCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p class="text-gray-600 mt-1">Track your learning progress and manage your classes</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ stats().registeredClasses }}</div>
                <div class="text-sm text-gray-500">Registered Classes</div>
                <div class="text-xs text-gray-400">Currently enrolled</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6h6m-7 0v8a2 2 0 002 2h8a2 2 0 002-2v-8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ stats().activeLessons }}</div>
                <div class="text-sm text-gray-500">Active Lessons</div>
                <div class="text-xs text-gray-400">In progress</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ stats().completed }}</div>
                <div class="text-sm text-gray-500">Completed</div>
                <div class="text-xs text-gray-400">Lessons finished</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-orange-100 rounded-lg">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ stats().exams }}</div>
                <div class="text-sm text-gray-500">Exams</div>
                <div class="text-xs text-gray-400">Upcoming tests</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Join New Class -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div class="flex items-start space-x-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Join a New Class</h3>
              <p class="text-gray-600 mb-4">Enter a class code provided by your teacher to join a new classroom</p>
              <div class="flex space-x-3">
                <input
                  [(ngModel)]="classCode"
                  type="text"
                  placeholder="Enter class code (e.g., 556210)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [disabled]="joiningClass"
                />
                <button
                  (click)="joinClass()"
                  [disabled]="!classCode?.trim() || joiningClass"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ joiningClass ? 'Joining...' : 'Join Class' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- My Classes -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">My Classes</h2>
            <span class="text-sm text-gray-500">{{ enrolledClasses().length }} enrolled</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="enrolledClasses().length > 0">
            <app-student-class-card
              *ngFor="let classroom of enrolledClasses()"
              [classroom]="classroom"
              (continue)="continueClass($event)">
            </app-student-class-card>
          </div>

          <!-- Empty State -->
          <div *ngIf="enrolledClasses().length === 0" class="text-center py-12">
            <div class="mb-4">
              <svg class="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
            <p class="text-gray-600 mb-6">Join your first class using a class code from your teacher</p>
            <button
              (click)="focusClassCodeInput()"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Join Your First Class
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  classCode = '';
  joiningClass = false;

  private studentFacade: StudentClassroomFacade = inject(StudentClassroomFacade);

  // Use facade computed values
  stats = this.studentFacade.stats;
  enrolledClasses = this.studentFacade.enrolledClassrooms;
  isLoading = this.studentFacade.isLoading;

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStudentData();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private async loadStudentData(): Promise<void> {
    try {
      await this.studentFacade.loadEnrolledClassrooms();
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  }

  async joinClass(): Promise<void> {
    if (!this.classCode?.trim()) return;

    this.joiningClass = true;
    try {
      const success = await this.studentFacade.joinClassroomByCode(this.classCode.trim());
      if (success) {
        this.classCode = '';
      }
      this.loadStudentData()
    } catch (error) {
      console.error('Failed to join class:', error);
      // TODO: Show error message to user
    } finally {
      this.joiningClass = false;
    }
  }

  continueClass(classroom: StudentClassroom): void {
    // Navigate to the classroom/lesson
    this.router.navigate([
      '/',
      RouteConstants.Paths.student,
      RouteConstants.Paths.classroom,
      classroom.id
    ]);
  }

  focusClassCodeInput(): void {
    // Focus the class code input
    const input = document.querySelector('input[placeholder*="class code"]') as HTMLInputElement;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
