import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ClassroomSummary } from '../facades/classroom-management.facade';
import {RouterLink} from "@angular/router";
import {RouteConstants} from "../../../../app/route.constants";

@Component({
  selector: 'app-classroom-item',
  standalone: true,
  imports: [DatePipe, NgIf, RouterLink,],
  template: `
    <div [routerLink]="linkPath" class="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors h-full flex flex-col justify-between">
      <div class="flex items-start justify-between">
        <!-- Left: Classroom Info -->
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="text-lg font-semibold text-gray-900">{{classroom?.name}}</h3>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                active
              </span>
            </div>
            <p *ngIf="classroom?.description" class="text-sm text-gray-600 mb-2">{{classroom?.description}}</p>
          </div>
        </div>

        <!-- Right: Access Code -->
        <div class="text-right">
          <p class="text-sm text-gray-500 mb-1">Access Code</p>
          <div class="flex items-center space-x-2">
            <code class="bg-white px-3 py-1 rounded-lg border text-lg font-mono font-bold">{{classroom?.code}}</code>
            <button (click)="copyCode.emit(classroom?.code || '')" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Copy access code">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-blue-600">{{($any(classroom).members?.length || 0)}}</div>
          <div class="text-xs text-gray-500">Students</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{lessonsCount || 0}}</div>
          <div class="text-xs text-gray-500">Lessons</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-600">2</div>
          <div class="text-xs text-gray-500">Active</div>
        </div>
      </div>

      <!-- Tags -->
      <div class="mt-4 flex items-center space-x-2">
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">HTML</span>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">CSS</span>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">JavaScript</span>
      </div>

      <!-- Time Stamp -->
      <div class="mt-4 text-xs text-gray-500">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{classroom?.createdAt | date:'short'}} ago
      </div>
    </div>
  `
})
export class ClassroomItemComponent {
  @Input() classroom!: ClassroomSummary;
  @Input() lessonsCount = 0;
  @Output() copyCode = new EventEmitter<string>();

  get linkPath() {
    return ['/', RouteConstants.Paths.admin, RouteConstants.Paths.classroom, this.classroom.id]
  }
}
