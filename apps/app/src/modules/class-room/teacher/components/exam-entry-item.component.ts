import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { ExamSummary } from '../facades/exams-management-facade.service';
import { RouterLink } from '@angular/router';
import { RouteConstants } from '../../../../app/route.constants';

@Component({
  selector: 'app-exam-item',
  standalone: true,
  imports: [DatePipe, NgIf, RouterLink, NgClass],
  template: `
    <div class="bg-white rounded-xl p-6 hover:bg-gray-100 transition-colors h-full flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <!-- Left: Exam Info -->
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="text-lg font-semibold text-gray-900">{{exam?.name}}</h3>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                {{ getTotalQuestions() }} questions
              </span>
            </div>
            <p *ngIf="exam?.description" class="text-sm text-gray-600 mb-2">{{exam?.description}}</p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-2">
          <button (click)="edit.emit(exam)"
                  class="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded"
                  aria-label="Edit exam">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button (click)="delete.emit(exam)"
                  class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                  aria-label="Delete exam">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Exam Stats -->
      <div class="mt-4 flex items-center space-x-4 text-xs text-gray-500">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          {{ getSectionCount() }} sections
        </div>
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Updated {{exam?.updatedAt | date:'short'}}
        </div>
      </div>

      <!-- Open Exam Button -->
      <div class="mt-4">
        <button [routerLink]="linkPath"
                class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          Open Exam
        </button>
      </div>
    </div>
  `
})
export class ExamEntryItemComponent {
  @Input() exam!: ExamSummary;
  @Input() classroomId!: string;
  @Input() studentsCount = 0;

  @Output() edit = new EventEmitter<ExamSummary>();
  @Output() delete = new EventEmitter<ExamSummary>();

  get linkPath() {
    return ['/', RouteConstants.Paths.admin, RouteConstants.Paths.classroom, this.classroomId, 'exam', this.exam.id];
  }

  getTotalQuestions(): number {
    try {
      const config = typeof this.exam.configuration === 'string'
        ? JSON.parse(this.exam.configuration)
        : this.exam.configuration;

      if (!Array.isArray(config)) return 0;

      return config.reduce((total, section) => {
        return total + (section.questions?.length || 0);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  getSectionCount(): number {
    try {
      const config = typeof this.exam.configuration === 'string'
        ? JSON.parse(this.exam.configuration)
        : this.exam.configuration;

      return Array.isArray(config) ? config.length : 0;
    } catch (e) {
      return 0;
    }
  }
}