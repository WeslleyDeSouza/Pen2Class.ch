import {Component, computed, inject, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EditorStoreService } from '../../services/editor-store.service';
import { MonacoEditorService } from '../../services/monaco-editor.service';

@Component({
  selector: 'app-html-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Tab Header -->
      <div class="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-orange-500 font-medium">HTML</span>
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
        @if(editorOptions){
          <ngx-monaco-editor
            [(ngModel)]="htmlCode"
            (ngModelChange)="onCodeChange($event)"
            [options]="editorOptions"
            class="w-full h-full"
          ></ngx-monaco-editor>
        }


        <!-- Error Panel -->
        @if (hasErrors()) {
          <div class="absolute bottom-2 left-2 right-2 z-10">
            <div class="bg-red-900 border border-red-700 rounded p-2 text-red-200 text-xs max-h-20 overflow-y-auto">
              @for (error of editorStore.htmlErrors(); track $index) {
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
export class HtmlEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly editorStore = inject(EditorStoreService);
  private readonly monacoService = inject(MonacoEditorService);

  protected htmlCode = '';
  protected editorOptions: any = undefined;

  canShowEditor = false;

  protected readonly lineCount = computed(() =>
    this.editorStore.htmlCode().split('\n').length
  );

  protected readonly hasErrors = computed(() =>
    this.editorStore.htmlErrors().length > 0
  );

  ngOnInit(): void {
    // Initialize editor options
    this.editorOptions = this.monacoService.getDefaultEditorOptions('html');

    // Set initial value
    this.htmlCode = this.editorStore.htmlCode();
  }

  ngAfterViewInit(): void {
    console.log('HTML Editor View Init', this.editorOptions );
    this.canShowEditor = true;
  }

  ngOnDestroy(): void {
    // Cleanup handled by ngx-monaco-editor-v2
  }

  protected onCodeChange(value: string): void {
    this.editorStore.updateHtmlCode(value);
  }
}
