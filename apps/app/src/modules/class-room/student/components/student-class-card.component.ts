import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StudentClassroom {
  id: string;
  name: string;
  description?: string;
  teacherName: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'active' | 'completed';
  technologies: string[];
  nextLesson?: {
    title: string;
    scheduledDate: string;
  };
}

@Component({
  selector: 'app-student-class-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <!-- Class Header -->
      <div class="p-6 pb-4">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ classroom.name }}</h3>
              <p class="text-sm text-gray-600">{{ classroom.teacherName }}</p>
            </div>
          </div>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            [ngClass]="classroom.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
          >
            {{ classroom.status }}
          </span>
        </div>

        <!-- Lesson Count -->
        <div class="mb-4">
          <div class="text-sm text-gray-600">
            {{ classroom.completedLessons }}/{{ classroom.totalLessons }} lessons completed
          </div>
        </div>

        <!-- Next Lesson (if available) -->
        <div *ngIf="classroom.nextLesson && classroom.status === 'active'" class="mb-4">
          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-gray-600">{{ classroom.nextLesson.title }}</span>
          </div>
          <div class="text-xs text-gray-500 ml-6">{{ classroom.nextLesson.scheduledDate }}</div>
        </div>

        <!-- Technologies -->
        <div class="flex flex-wrap gap-1 mb-4">
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

      <!-- Action Button -->
      <div class="px-6 pb-6">
        <button
          (click)="continue.emit(classroom)"
          class="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          [disabled]="classroom.status === 'completed'"
        >
          {{ classroom.status === 'completed' ? 'Review Materials' : 'Continue Learning' }}
        </button>
      </div>
    </div>
  `
})
export class StudentClassCardComponent {
  @Input() classroom!: StudentClassroom;
  @Output() continue = new EventEmitter<StudentClassroom>();
}