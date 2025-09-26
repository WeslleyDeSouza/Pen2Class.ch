import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf,  } from '@angular/common';
import {FormsModule} from "@angular/forms";

export interface LessonDialogModel {
  name: string;
  description?: string;
  enabled?: boolean;
}

@Component({
  selector: 'app-lesson-dialog',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" (click)="onCancel()"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title || 'Lesson' }}</h3>
          <button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input [(ngModel)]="model.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" placeholder="Enter lesson name" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="model.description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" placeholder="Optional description"></textarea>
          </div>

          <label class="inline-flex items-center space-x-2 select-none">
            <input [(ngModel)]="model.enabled" type="checkbox" class="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
            <span class="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div class="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-2">
          <button (click)="onCancel()" class="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button [disabled]="!model.name?.trim()" (click)="onSave()" class="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  `
})
export class LessonDialogComponent {
  @Input() open = false;
  @Input() title = 'Lesson';
  @Input() model: LessonDialogModel = { name: '' };

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<LessonDialogModel>();

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    if (!this.model?.name?.trim()) return;
    // emit a shallow copy to avoid external mutation
    this.save.emit({ ...this.model });
  }
}
