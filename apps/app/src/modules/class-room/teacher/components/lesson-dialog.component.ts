import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf,  } from '@angular/common';
import {FormsModule} from "@angular/forms";
import { prettify } from 'htmlfy'
interface LessonStep {
  step: string;
  duration?: number;
  content: string;
  sampleCodeExercise: string;
  footer: string;
}

export interface LessonDialogModel {
  name: string;
  description?: string;
  enabled?: boolean;
  configuration?: string; // JSON string for lesson configuration
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
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title || 'Lesson' }}</h3>
          <button (click)="onCancel()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              (click)="activeTab = 'general'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              [ngClass]="activeTab === 'general' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              General
            </button>
            <button
              (click)="activeTab = 'steps'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              [ngClass]="activeTab === 'steps' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Steps
            </button>
            <button
              (click)="activeTab = 'preview'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              [ngClass]="activeTab === 'preview' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Preview
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="px-5 py-4 min-h-96">
          <!-- General Tab -->
          <div *ngIf="activeTab === 'general'" class="space-y-4">
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

          <!-- Steps Tab -->
          <div *ngIf="activeTab === 'steps'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lesson Configuration (JSON)</label>
              <textarea
                [(ngModel)]="model.configuration"
                [placeholder]="placeHolder"
                rows="12"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 font-mono text-sm"
              ></textarea>
            </div>
            <div *ngIf="getJsonError()" class="text-sm text-red-600">
              {{ getJsonError() }}
            </div>
          </div>

          <!-- Preview Tab -->
          <div *ngIf="activeTab === 'preview'" class="flex h-96 -mx-5">
            <!-- Main Content -->
            <div class="flex-1 p-6 overflow-y-auto">
              <div *ngIf="getCurrentStep(); else noSteps">
                <h2 class="text-xl font-bold text-gray-900 mb-4">{{ getCurrentStep()?.step }}</h2>

                <div class="text-gray-700 mb-6" [innerHTML]="formatContent($any(getCurrentStep())?.content)"></div>

                <div *ngIf="getCurrentStep()?.sampleCodeExercise" class="mb-6">
                  <h3 class="text-sm font-semibold text-gray-900 mb-2">Sample Code Exercise</h3>
                  <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div  >
                      {{formatContent($any(getCurrentStep())?.sampleCodeExercise)}}
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noSteps>
                <div class="text-center py-8">
                  <p class="text-gray-500">No valid steps found. Please add steps in the Steps tab.</p>
                </div>
              </ng-template>

              <!-- Navigation -->
              <div class="flex items-center justify-between pt-6 border-t" *ngIf="getParsedSteps().length > 0">
                <button
                  (click)="previousStep()"
                  [disabled]="currentStepIndex === 0"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>

                <span class="text-sm text-gray-600">
                  Lesson {{ currentStepIndex + 1 }} of {{ getParsedSteps().length }}
                </span>

                <button
                  (click)="nextStep()"
                  [disabled]="currentStepIndex === getParsedSteps().length - 1"
                  class="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Course Lessons</h3>

              <div class="space-y-2" *ngIf="getParsedSteps().length > 0; else noLessons">
                <div
                  *ngFor="let step of getParsedSteps(); let i = index"
                  (click)="setCurrentStep(i)"
                  class="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                  [ngClass]="i === currentStepIndex ? 'bg-blue-100 text-blue-800' : 'hover:bg-white'">

                  <div class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3"
                       [ngClass]="i === currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'">
                    {{ i + 1 }}
                  </div>

                  <div class="flex-1">
                    <div class="text-sm font-medium" [ngClass]="i === currentStepIndex ? 'text-blue-900' : 'text-gray-900'">
                      {{ step.step }}
                    </div>
                    <div [hidden]="!step.duration" class="text-xs text-gray-500 mt-1">
                      {{ step.duration }} min
                    </div>
                  </div>

                  <div *ngIf="i === currentStepIndex" class="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              </div>

              <ng-template #noLessons>
                <div class="text-center py-8">
                  <p class="text-sm text-gray-500">No lessons available</p>
                </div>
              </ng-template>
            </div>
          </div>
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

  activeTab: 'general' | 'steps' | 'preview' = 'general';
  currentStepIndex = 0;

  protected placeHolder = `[
  {
    "step": "Introduction",
    "content": "This is where the lesson content would be displayed. In a real implementation, this would include:\\n\\n- Interactive tutorials\\n- Code examples and exercises\\n- Video content\\n- Reading materials\\n- Practice assignments",
    "sampleCodeExercise": "",
    "footer": ""
  },
  {
    "step": "CSS Flexbox Layout Example",
    "content": "Learn how to create a responsive layout with Flexbox. Items are evenly spaced, aligned in the center, and take equal width.",
    "sampleCodeExercise": "// Example CSS Flexbox layout\\n.container {\\n  display: flex;\\n  justify-content: space-between;\\n  align-items: center;\\n  padding: 20px;\\n}\\n\\n.item {\\n  flex: 1;\\n  margin: 0 10px;\\n}",
    "footer": ""
  }
]`

  ngOnInit() {
   console.log(this.model)
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    if (!this.model?.name?.trim()) return;
    // emit a shallow copy to avoid external mutation
    this.save.emit({ ...this.model });
  }

  getJsonError(): string {
    if (!this.model.configuration?.trim()) return '';
    try {
      JSON.parse(this.model.configuration);
      return '';
    } catch (e) {
      return 'Invalid JSON format';
    }
  }

  getParsedSteps(): LessonStep[] {
    if (!this.model.configuration?.trim()) return [];
    try {
      const parsed = JSON.parse(this.model.configuration);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  getCurrentStep(): LessonStep | null {
    const steps = this.getParsedSteps();
    return steps[this.currentStepIndex] || null;
  }

  setCurrentStep(index: number): void {
    const steps = this.getParsedSteps();
    if (index >= 0 && index < steps.length) {
      this.currentStepIndex = index;
    }
  }

  nextStep(): void {
    const steps = this.getParsedSteps();
    if (this.currentStepIndex < steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  formatContent(content: string): string {
    if (!content) return '';
    return   prettify(
      content
,{ ignore: ['style'] }  )
      .replace('. ','.')
      .replace(/\. /g, ".")
  }

  getEstimatedDuration(step: LessonStep): number {
    // Simple estimation based on content length and code presence
    const contentLength = (step.content || '').length;
    const hasCode = !!(step.sampleCodeExercise || '').trim();

    let baseDuration = Math.max(5, Math.ceil(contentLength / 50));
    if (hasCode) baseDuration += 10;

    return Math.min(baseDuration, 60); // Cap at 60 minutes
  }
}
