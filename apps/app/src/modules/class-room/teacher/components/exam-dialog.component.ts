import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { prettify } from 'htmlfy';

interface ExamQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface ExamStep {
  step: string;
  content: string;
  questions: ExamQuestion[];
}

export interface ExamDialogModel {
  name: string;
  description?: string;
  enabled?: boolean;
  configuration?: string; // JSON string for exam configuration
}

@Component({
  selector: 'app-exam-dialog',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" (click)="onCancel()"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title || 'Exam' }}</h3>
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
              (click)="activeTab = 'questions'"
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              [ngClass]="activeTab === 'questions' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Questions
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
              <input [(ngModel)]="model.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900" placeholder="Enter exam name" />
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

          <!-- Questions Tab -->
          <div *ngIf="activeTab === 'questions'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Exam Configuration (JSON)</label>
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

                <!-- Questions -->
                <div *ngIf="getCurrentStep()?.questions && $any(getCurrentStep())?.questions.length > 0" class="space-y-6">
                  <div
                    *ngFor="let question of getCurrentStep()?.questions; let i = index"
                    class="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 class="font-medium text-gray-900 mb-3">{{ i + 1 }}. {{ question.question }}</h4>

                    <div class="space-y-2">
                      <label
                        *ngFor="let option of question.options; let j = index"
                        class="flex items-start space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          [name]="'question_' + currentStepIndex + '_' + i"
                          [value]="option"
                          class="mt-1 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="text-gray-700">{{ option }}</span>
                      </label>
                    </div>

                    <div class="mt-2 text-xs text-gray-500">
                      Correct answer: {{ question.answer }}
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noSteps>
                <div class="text-center py-8">
                  <p class="text-gray-500">No valid exam found. Please add questions in the Questions tab.</p>
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
                  Section {{ currentStepIndex + 1 }} of {{ getParsedSteps().length }}
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
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Exam Sections</h3>

              <div class="space-y-2" *ngIf="getParsedSteps().length > 0; else noSections">
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
                    <div class="text-xs text-gray-500 mt-1">
                      {{ step.questions?.length || 0 }} questions
                    </div>
                  </div>

                  <div *ngIf="i === currentStepIndex" class="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              </div>

              <ng-template #noSections>
                <div class="text-center py-8">
                  <p class="text-sm text-gray-500">No sections available</p>
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
export class ExamDialogComponent {
  @Input() open = false;
  @Input() title = 'Exam';
  @Input() model: ExamDialogModel = { name: '' };

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ExamDialogModel>();

  activeTab: 'general' | 'questions' | 'preview' = 'general';
  currentStepIndex = 0;

  protected placeHolder = `[
  {
    "step": "Quiz: CSS Flexbox Basics",
    "content": "Test your knowledge about Flexbox layout properties.",
    "questions": [
      {
        "question": "Which CSS property activates Flexbox on a container?",
        "options": [
          "display: block",
          "display: flex",
          "flex: 1",
          "position: relative"
        ],
        "answer": "display: flex"
      },
      {
        "question": "Which property controls the alignment of items along the main axis?",
        "options": [
          "align-items",
          "justify-content",
          "align-content",
          "flex-direction"
        ],
        "answer": "justify-content"
      },
      {
        "question": "What does 'flex: 1' do to a flex item?",
        "options": [
          "Fixes its width to 1px",
          "Makes it shrink only",
          "Allows it to grow and take available space",
          "Centers the item"
        ],
        "answer": "Allows it to grow and take available space"
      }
    ]
  }
]`;

  ngOnInit() {
    console.log(this.model);
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

  getParsedSteps(): ExamStep[] {
    if (!this.model.configuration?.trim()) return [];
    try {
      const parsed = JSON.parse(this.model.configuration);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  getCurrentStep(): ExamStep | null {
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
    return prettify(
      content,
      { ignore: ['style'] }
    )
      .replace('. ', '.')
      .replace(/\. /g, ".");
  }

  getTotalQuestions(): number {
    const steps = this.getParsedSteps();
    return steps.reduce((total, step) => total + (step.questions?.length || 0), 0);
  }
}
