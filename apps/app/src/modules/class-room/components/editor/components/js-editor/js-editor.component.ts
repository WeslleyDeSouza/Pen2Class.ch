import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorStoreService } from '../../services/editor-store.service';
import { MonacoEditorService } from '../../services/monaco-editor.service';
import {EditorComponent} from "@class2pen/monaco-editor";

@Component({
  selector: 'app-js-editor',
  standalone: true,
  imports: [FormsModule, EditorComponent,],
  template: `
    <div class="flex flex-col h-full">
      <!-- Tab Header -->
      <div class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-yellow-500 font-medium">JS</span>
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
          [(ngModel)]="jsCode"
          (ngModelChange)="onCodeChange($event)"
          [options]="editorOptions"
          class="w-full h-full"
        ></ngx-monaco-editor>

        <!-- Error Panel -->
        @if (hasErrors()) {
          <div class="absolute bottom-2 left-2 right-2 z-10">
            <div class="bg-red-900 border border-red-700 rounded p-2 text-red-200 text-xs max-h-20 overflow-y-auto">
              @for (error of editorStore.jsErrors(); track $index) {
                <div class="flex items-center space-x-2 mb-1 last:mb-0">
                  <span class="text-red-400">⚠</span>
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
export class JsEditorComponent implements OnInit, OnDestroy {
  protected readonly editorStore = inject(EditorStoreService);
  private readonly monacoService = inject(MonacoEditorService);

  protected jsCode = '';
  protected editorOptions: any = {};

  protected readonly lineCount = computed(() =>
    this.editorStore.jsCode().split('\n').length
  );

  protected readonly hasErrors = computed(() =>
    this.editorStore.jsErrors().length > 0
  );

  ngOnInit(): void {
    // Initialize editor options
    this.editorOptions = this.monacoService.getDefaultEditorOptions('javascript');

    // Set initial value
    this.jsCode = this.editorStore.jsCode();
  }

  ngOnDestroy(): void {
    // Cleanup handled by ngx-monaco-editor-v2
  }

  protected onCodeChange(value: string): void {
    this.editorStore.updateJsCode(value);
  }
}
