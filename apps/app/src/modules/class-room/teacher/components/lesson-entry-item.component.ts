import { Component, EventEmitter, Input, Output } from '@angular/core';
import {DatePipe, NgClass, NgIf} from '@angular/common';
import { LessonSummary } from '../facades/lesson-management.facade';
import { RouterLink } from '@angular/router';
import { RouteConstants } from '../../../../app/route.constants';

@Component({
  selector: 'app-lesson-item',
  standalone: true,
  imports: [DatePipe, NgIf, RouterLink, NgClass],
  template: `
    <div class="bg-white rounded-xl p-6 hover:bg-gray-100 transition-colors h-full flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <!-- Left: Lesson Info -->
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="text-lg font-semibold text-gray-900">{{lesson?.name}}</h3>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="lesson?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                <div class="w-1.5 h-1.5 rounded-full mr-1"
                     [ngClass]="lesson?.enabled ? 'bg-green-400' : 'bg-gray-400'"></div>
                {{lesson?.enabled ? 'active' : 'inactive'}}
              </span>
            </div>
            <p *ngIf="lesson?.description" class="text-sm text-gray-600 mb-2">{{lesson?.description}}</p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-2">
          <button (click)="edit.emit(lesson)"
                  class="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                  aria-label="Edit lesson">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button (click)="delete.emit(lesson)"
                  class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                  aria-label="Delete lesson">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>


      <!-- Time Stamp -->
      <div class="mt-4 text-xs text-gray-500">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Updated {{lesson?.updatedAt | date:'short'}}
      </div>

      <!-- Open Lesson Button -->
      <div class="mt-4">
        <button [routerLink]="linkPath"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          View Students
        </button>
      </div>
    </div>
  `
})
export class LessonEntryItemComponent {
  @Input() lesson!: LessonSummary;
  @Input() classroomId!: string;
  @Input() studentsCount = 0;
  @Input() activitiesCount = 0;

  @Output() edit = new EventEmitter<LessonSummary>();
  @Output() delete = new EventEmitter<LessonSummary>();

  get linkPath() {
    return ['/', RouteConstants.Paths.admin, RouteConstants.Paths.classroom, this.classroomId, RouteConstants.Paths.lesson, this.lesson.id];
  }
}
