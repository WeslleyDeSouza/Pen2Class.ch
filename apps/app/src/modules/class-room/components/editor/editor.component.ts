import {Component, computed, inject, OnInit, OnDestroy, effect, signal} from '@angular/core';
import { EditorStoreService } from './services/editor-store.service';
import { HtmlEditorComponent } from './components/html-editor/html-editor.component';
import { CssEditorComponent } from './components/css-editor/css-editor.component';
import { JsEditorComponent } from './components/js-editor/js-editor.component';
import { PreviewComponent } from './components/preview/preview.component';
import {EditorService} from "./services/editor-facade.service";
import { ActivatedRoute } from '@angular/router';
import {UserStoreService} from "../../../../common/store";
import {RouteConstants} from "../../../../app/route.constants";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    HtmlEditorComponent,
    CssEditorComponent,
    JsEditorComponent,
    PreviewComponent
  ],
  template: `
    <div class="h-screen bg-gray-900 flex flex-col">
      <!-- Header -->
      <div class="bg-gray-800 border-b border-gray-700 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-2xl font-bold text-white">
              <span class="text-green-400">Pen</span>
              <span class="text-blue-500">2</span>Class
            </div>
            <div class="text-gray-400 text-sm">Classroom Editor - {{lessonName}}</div>
          </div>
          <div [hidden]="true">
            <div class="flex space-x-2">
              <button
                (click)="saveCode()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Save
              </button>
              <button
                (click)="shareCode()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Share
              </button>
              <button
                (click)="resetCode()"
                class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors"
                title="Reset to default code"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex">
        @if(loaded()){
          <!-- Code Editor Section -->
          <div class="w-1/2 flex flex-col border-r border-gray-700">
            <!-- Tab Navigation -->
            <div class="bg-gray-800 flex border-b border-gray-700">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="setActiveTab(tab.id)"
                  class="px-6 py-3 text-sm font-medium transition-colors border-b-2 relative"
                  [class]="getTabClasses(tab)"
                >
                  {{ tab.label }}
                  @if (hasTabErrors(tab.id)) {
                    <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  }
                </button>
              }
            </div>

            <!-- Active Editor -->
            <div class="flex-1">
              @switch (editorStore.activeTab()) {
                @case ('html') {
                  <app-html-editor />
                }
                @case ('css') {
                  <app-css-editor />
                }
                @case ('js') {
                  <app-js-editor />
                }
                @default {
                  <app-html-editor />
                }
              }
            </div>
          </div>

          <!-- Preview Section -->
          <div class="w-1/2">
            <app-preview />
          </div>
        }
      </div>

      <!-- Status Bar -->
      <div class="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
        <div class="flex items-center space-x-4">
          <span>Active: {{ editorStore.activeTab().toUpperCase() }}</span>
          <span>|</span>
          <span>
            Errors:
            <span [class.text-red-400]="totalErrors() > 0" [class.text-green-400]="totalErrors() === 0">
              {{ totalErrors() }}
            </span>
          </span>
          <span>|</span>
          <span>Lines: {{ getCurrentLineCount() }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full"
                [class.bg-green-400]="totalErrors() === 0"
                [class.bg-red-400]="totalErrors() > 0">
          </span>
          <span>{{ totalErrors() === 0 ? 'Ready' : 'Errors detected' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-active {
      @apply border-current bg-gray-700;
    }

    .tab-inactive {
      @apply border-transparent hover:text-gray-200 hover:bg-gray-700;
    }
  `]
})
export class EditorComponent implements OnInit, OnDestroy {

  lessonName!:string

  protected readonly userStore = inject(UserStoreService);
  protected readonly editorStore = inject(EditorStoreService);
  protected readonly editorApi = inject(EditorService);
  private readonly route = inject(ActivatedRoute);

  private saveTimeout: any = null;

  protected readonly tabs = [
    { id: 'html' as const, label: 'HTML', color: 'text-orange-500' },
    { id: 'css' as const, label: 'CSS', color: 'text-blue-500' },
    { id: 'js' as const, label: 'JS', color: 'text-yellow-500' }
  ];

  protected readonly totalErrors = computed(() =>
    this.editorStore.htmlErrors().length +
    this.editorStore.cssErrors().length +
    this.editorStore.jsErrors().length
  );

  loaded = signal(false);

  // should have value from this.router.snapshot.paramMap.get('userId')
  viewModeUserId = signal<string | undefined>(undefined)

  skipFirstChange = 0
  constructor() {
      // Initialize view mode userId from route params if present
      const userIdParam = this.route.snapshot.paramMap.get(RouteConstants.Params.userId);
      this.viewModeUserId.set(userIdParam ?? undefined);

      effect(() => {
        const editorState = this.editorStore.editorState();

        if (!this.userStore.selectedLessonId()) return;

        // Clear existing timeout
        if (this.saveTimeout) {
          clearTimeout(this.saveTimeout);
        }

        if(this.skipFirstChange === 0){
          this.skipFirstChange++
          return;
        }

        // Debounce the save call by 800ms
        this.saveTimeout = setTimeout(() => {
          this.editorApi.saveEditorState(this.objectKey, this.id);
        }, 800);
      });

      effect(() => {
        const selectedLessonId = this.userStore.selectedLessonId() || this.route.snapshot.paramMap.get(RouteConstants.Params.userId);
        if (selectedLessonId ) this.getByKey();
      });
    }

  get id(){
    return ''
  }

  get objectKey(){
    return (
      {
        userId: this.viewModeUserId() as string,
        lessionId: this.userStore.selectedLessonId() as string || this.route.snapshot.paramMap.get(RouteConstants.Params.lessonId) as string,
        classroomId: this.userStore.selectedClassId() as string || this.route.snapshot.paramMap.get(RouteConstants.Params.classRoomId) as string,
      }
    )
  }

  getByKey(){
    this.editorApi.getByKey(this.objectKey).then(data => {
      if (data?.data) {
        const editorData = data.data as any;

        // Update editor state with the retrieved data
        if (editorData.html !== undefined) {
          this.editorStore.updateHtmlCode(editorData.html);
        }
        if (editorData.css !== undefined) {
          this.editorStore.updateCssCode(editorData.css);
        }
        if (editorData.js !== undefined) {
          this.editorStore.updateJsCode(editorData.js);
        }
      }
    }).catch(error => {
      console.error('Failed to load editor state:', error);
    }).finally(() => {
      this.loaded.set(true)
    })
  }

  ngOnInit(): void {
    // Any initialization logic can go here
    console.log('Editor component initialized');
  }

  ngOnDestroy(): void {
    // Clean up the save timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    console.log('Editor component destroyed');
  }

  protected setActiveTab(tabId: 'html' | 'css' | 'js'): void {
    this.editorStore.setActiveTab(tabId);
  }

  protected getTabClasses(tab: typeof this.tabs[0]): string {
    const isActive = this.editorStore.activeTab() === tab.id;
    const baseClasses = isActive
      ? `${tab.color} border-current bg-gray-700`
      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-700';

    return baseClasses;
  }

  protected hasTabErrors(tabId: 'html' | 'css' | 'js'): boolean {
    switch (tabId) {
      case 'html':
        return this.editorStore.htmlErrors().length > 0;
      case 'css':
        return this.editorStore.cssErrors().length > 0;
      case 'js':
        return this.editorStore.jsErrors().length > 0;
      default:
        return false;
    }
  }

  protected getCurrentLineCount(): number {
    switch (this.editorStore.activeTab()) {
      case 'html':
        return this.editorStore.htmlCode().split('\n').length;
      case 'css':
        return this.editorStore.cssCode().split('\n').length;
      case 'js':
        return this.editorStore.jsCode().split('\n').length;
      default:
        return 0;
    }
  }

  protected saveCode(): void {
    // This will be used later to send data via peer
    const editorState = this.editorStore.editorState();
    console.log('Saving code state:', editorState);

    // Here you would integrate with the peer service to send the data
    // For now, just show a success message
    this.editorStore.addConsoleMessages([{
      type: 'info',
      content: 'Code saved successfully!',
      timestamp: Date.now()
    }]);
  }

  protected shareCode(): void {
    // Generate a shareable link or copy code to clipboard
    const editorState = this.editorStore.editorState();

    // For demonstration, we'll copy the combined code to clipboard
    const combinedCode = `HTML:\n${editorState.html}\n\nCSS:\n${editorState.css}\n\nJS:\n${editorState.js}`;

    navigator.clipboard.writeText(combinedCode).then(() => {
      this.editorStore.addConsoleMessages([{
        type: 'info',
        content: 'Code copied to clipboard!',
        timestamp: Date.now()
      }]);
    }).catch(() => {
      this.editorStore.addConsoleMessages([{
        type: 'error',
        content: 'Failed to copy code to clipboard',
        timestamp: Date.now()
      }]);
    });
  }

  protected resetCode(): void {
    // Reset to default values
    this.editorStore.updateHtmlCode(`<div class="container">
  <h1>Hello Pen2Class!</h1>
  <p>Edit the code to see changes live.</p>
  <button id="myButton">Click me!</button>
</div>`);

    this.editorStore.updateCssCode(`.container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

h1 {
  color: #2ecc71;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 30px;
}

button {
  background: linear-gradient(45deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

button:hover {
  transform: scale(1.05);
}`);

    this.editorStore.updateJsCode(`document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('myButton');

  button.addEventListener('click', function() {
    button.style.background = 'linear-gradient(45deg, #e74c3c, #f39c12)';
  });
});`);

    this.editorStore.addConsoleMessages([{
      type: 'info',
      content: 'Code reset to default values',
      timestamp: Date.now()
    }]);
  }
}
