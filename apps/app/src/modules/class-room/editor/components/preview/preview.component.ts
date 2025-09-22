import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { EditorStoreService, ConsoleMessage } from '../../services/editor-store.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col h-full">
      <!-- Preview Header -->
      <div class="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-medium">Preview</h3>
          <div class="flex space-x-2">
            <button
              (click)="refreshPreview()"
              class="text-gray-400 hover:text-white text-sm p-1 rounded hover:bg-gray-700"
              title="Refresh Preview"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              (click)="openInNewWindow()"
              class="text-gray-400 hover:text-white text-sm p-1 rounded hover:bg-gray-700"
              title="Open in New Window"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Frame -->
      <div class="flex-1 bg-white relative">
        @if (isLoading) {
          <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div class="flex items-center space-x-2 text-gray-600">
              <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span class="text-sm">Loading preview...</span>
            </div>
          </div>
        }
        <iframe
          #previewFrame
          [srcdoc]="editorStore.previewContent()"
          class="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin"
          title="Code Preview"
          (load)="onIframeLoad()"
        ></iframe>
      </div>

      <!-- Console Panel -->
      <div class="h-32 bg-gray-800 border-t border-gray-700 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <div class="text-gray-400 text-xs font-medium">Console</div>
          <button
            (click)="clearConsole()"
            class="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
        <div class="flex-1 overflow-y-auto text-sm font-mono">
          @for (message of editorStore.consoleMessages(); track message.timestamp) {
            <div
              class="mb-1"
              [class.text-red-400]="message.type === 'error'"
              [class.text-blue-400]="message.type === 'info'"
              [class.text-yellow-400]="message.type === 'warn'"
              [class.text-green-400]="message.type === 'log'"
            >
              <span class="text-xs text-gray-500 mr-2">
                {{ formatTime(message.timestamp) }}
              </span>
              @switch (message.type) {
                @case ('error') {
                  <span class="mr-1">❌</span>
                }
                @case ('warn') {
                  <span class="mr-1">⚠️</span>
                }
                @case ('info') {
                  <span class="mr-1">ℹ️</span>
                }
                @default {
                  <span class="mr-1">📝</span>
                }
              }
              {{ message.content }}
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    iframe {
      background: white;
    }

    /* Custom scrollbar for console */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
      background: #374151;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #6b7280;
      border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `]
})
export class PreviewComponent implements OnInit, OnDestroy {
  protected readonly editorStore = inject(EditorStoreService);
  protected isLoading = false;

  ngOnInit(): void {
    // Listen for messages from iframe
    window.addEventListener('message', this.handleIframeMessage.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleIframeMessage.bind(this));
  }

  @HostListener('window:message', ['$event'])
  protected handleIframeMessage(event: MessageEvent): void {
    if (event.data?.type === 'console' && Array.isArray(event.data.messages)) {
      const messages: ConsoleMessage[] = event.data.messages.map((msg: any) => ({
        type: msg.type || 'log',
        content: msg.content || '',
        timestamp: msg.timestamp || Date.now()
      }));
      this.editorStore.addConsoleMessages(messages);
    }
  }

  protected refreshPreview(): void {
    this.isLoading = true;
    // Force iframe reload by updating srcdoc
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  protected openInNewWindow(): void {
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(this.editorStore.previewContent());
      newWindow.document.close();
    }
  }

  protected clearConsole(): void {
    this.editorStore.clearConsole();
  }

  protected onIframeLoad(): void {
    this.isLoading = false;
  }

  protected formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
