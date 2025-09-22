import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EditorStoreService } from '../../services/editor-store.service';
import { MonacoEditorService } from '../../services/monaco-editor.service';

@Component({
  selector: 'app-css-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Tab Header -->
      <div class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-blue-500 font-medium">CSS</span>
          @if (hasErrors()) {
            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
          }
        </div>
        <div class="text-xs text-gray-400">
          Lines: {{ lineCount() }}
        </div>
      </div>

      <!-- Monaco Editor -->
      <div class="flex-1 relative">
        <ngx-monaco-editor
          [(ngModel)]="cssCode"
          (ngModelChange)="onCodeChange($event)"
          [options]="editorOptions"
          class="w-full h-full"
        ></ngx-monaco-editor>

        <!-- Error/Warning Panel -->
        @if (hasErrors() || hasWarnings()) {
          <div class="absolute bottom-2 left-2 right-2 z-10">
            <div
              class="border rounded p-2 text-xs max-h-20 overflow-y-auto"
              [class.bg-red-900]="hasErrors()"
              [class.border-red-700]="hasErrors()"
              [class.text-red-200]="hasErrors()"
              [class.bg-yellow-900]="!hasErrors() && hasWarnings()"
              [class.border-yellow-700]="!hasErrors() && hasWarnings()"
              [class.text-yellow-200]="!hasErrors() && hasWarnings()"
            >
              @for (error of editorStore.cssErrors(); track $index) {
                <div class="flex items-center space-x-2 mb-1 last:mb-0">
                  @if (error.type === 'error') {
                    <span class="text-red-400">⚠</span>
                  } @else {
                    <span class="text-yellow-400">⚡</span>
                  }
                  <span>Line {{ error.line }}: {{ error.message }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    ngx-monaco-editor {
      display: block;
      height: 100%;
    }

    :host ::ng-deep .monaco-editor {
      background: #1f2937 !important;
    }
  `]
})
export class CssEditorComponent implements OnInit, OnDestroy {
  protected readonly editorStore = inject(EditorStoreService);
  private readonly monacoService = inject(MonacoEditorService);

  protected cssCode = '';
  protected editorOptions: any = {};

  protected readonly lineCount = computed(() =>
    this.editorStore.cssCode().split('\n').length
  );

  protected readonly hasErrors = computed(() =>
    this.editorStore.cssErrors().some(error => error.type === 'error')
  );

  protected readonly hasWarnings = computed(() =>
    this.editorStore.cssErrors().some(error => error.type === 'warning')
  );

  ngOnInit(): void {
    // Initialize editor options
    this.editorOptions = this.monacoService.getDefaultEditorOptions('css');

    // Set initial value
    this.cssCode = this.editorStore.cssCode();
  }

  ngOnDestroy(): void {
    // Cleanup handled by ngx-monaco-editor-v2
  }

  protected onCodeChange(value: string): void {
    this.editorStore.updateCssCode(value);
  }
}