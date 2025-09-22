import {Injectable, signal, computed, inject} from '@angular/core';
import cssValidator from 'w3c-css-validator';
import {ValidateTextResultWithWarnings} from "w3c-css-validator/dist/types/result";

export interface EditorError {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export interface EditorState {
  html: string;
  css: string;
  js: string;
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'info' | 'warn';
  content: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class EditorStoreService {
  // Code content signals
  private _objectId = signal<string | undefined>(undefined);
  private _htmlCode = signal<string>(`<div class="container">
  <h1>Hello Pen2Class!</h1>
  <p>Edit the code to see changes live.</p>
  <button id="myButton">Click me!</button>
</div>`);

  private _cssCode = signal<string>(`.container {
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

  private _jsCode = signal<string>(`document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('myButton');

  button.addEventListener('click', function() {
    alert('Hello from Pen2Class!');
    button.style.background = 'linear-gradient(45deg, #e74c3c, #f39c12)';
  });
});`);

  // Error signals
  private _htmlErrors = signal<EditorError[]>([]);
  private _cssErrors = signal<EditorError[]>([]);
  private _jsErrors = signal<EditorError[]>([]);

  // Console messages
  private _consoleMessages = signal<ConsoleMessage[]>([
    { type: 'info', content: 'Ready to run your code...', timestamp: Date.now() }
  ]);

  // Active tab
  private _activeTab = signal<'html' | 'css' | 'js'>('html');

  // Computed properties
  readonly htmlCode = this._htmlCode.asReadonly();
  readonly cssCode = this._cssCode.asReadonly();
  readonly jsCode = this._jsCode.asReadonly();

  readonly htmlErrors = this._htmlErrors.asReadonly();
  readonly cssErrors = this._cssErrors.asReadonly();
  readonly jsErrors = this._jsErrors.asReadonly();

  readonly consoleMessages = this._consoleMessages.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();

  // Computed preview content
  readonly previewContent = computed(() => {
    const jsWithConsoleCapture = `
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        const messages = [];

        console.log = function(...args) {
          messages.push({ type: 'log', content: args.join(' '), timestamp: Date.now() });
          originalLog.apply(console, args);
        };

        console.error = function(...args) {
          messages.push({ type: 'error', content: args.join(' '), timestamp: Date.now() });
          originalError.apply(console, args);
        };

        console.warn = function(...args) {
          messages.push({ type: 'warn', content: args.join(' '), timestamp: Date.now() });
          originalWarn.apply(console, args);
        };

        console.info = function(...args) {
          messages.push({ type: 'info', content: args.join(' '), timestamp: Date.now() });
          originalInfo.apply(console, args);
        };

        window.addEventListener('error', function(e) {
          messages.push({ type: 'error', content: e.message + ' (Line: ' + e.lineno + ')', timestamp: Date.now() });
        });

        try {
          ${this._jsCode()}
        } catch (error) {
          messages.push({ type: 'error', content: error.message, timestamp: Date.now() });
        }

        setTimeout(() => {
          if (messages.length > 0) {
            window.parent.postMessage({ type: 'console', messages }, '*');
          }
        }, 100);
      })();
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${this._cssCode()}</style>
        </head>
        <body>
          ${this._htmlCode()}
          <script>${jsWithConsoleCapture}</script>
        </body>
      </html>
    `;
  });

  // Computed combined state for peer communication
  readonly editorState = computed<EditorState>(() => ({
    html: this._htmlCode(),
    css: this._cssCode(),
    js: this._jsCode()
  }));

  // Methods to update code
  updateHtmlCode(code: string): void {
    this._htmlCode.set(code);
    this.validateHtml(code);
  }

  updateCssCode(code: string): void {
    this._cssCode.set(code);
    this.validateCss(code)
      .then(result => console.log('CSS validation result:', result))
      .catch(error => {
      console.error('CSS validation error:', error);
    });
  }

  updateJsCode(code: string): void {
    this._jsCode.set(code);
    this.validateJs(code);
  }

  // Set active tab
  setActiveTab(tab: 'html' | 'css' | 'js'): void {
    this._activeTab.set(tab);
  }

  // Add console message
  addConsoleMessages(messages: ConsoleMessage[]): void {
    this._consoleMessages.update(current => [
      { type: 'info', content: 'Code executed...', timestamp: Date.now() },
      ...messages
    ]);
  }

  // Clear console
  clearConsole(): void {
    this._consoleMessages.set([
      { type: 'info', content: 'Ready to run your code...', timestamp: Date.now() }
    ]);
  }

  // Load editor state (for peer synchronization)
  loadEditorState(state: EditorState): void {
    this._htmlCode.set(state.html);
    this._cssCode.set(state.css);
    this._jsCode.set(state.js);
    this.validateHtml(state.html);
    this.validateCss(state.css).catch(error => {
      console.error('CSS validation error on load:', error);
    });
    this.validateJs(state.js);
  }

  // Validation methods
  private validateHtml(html: string): void {
    const errors: EditorError[] = [];

    // Check for unclosed tags
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];

    const openTagNames = openTags.map(tag => {
      const match = tag.match(/<(\w+)/);
      return match ? match[1].toLowerCase() : null;
    }).filter(Boolean);

    const closeTagNames = closeTags.map(tag => {
      const match = tag.match(/<\/(\w+)/);
      return match ? match[1].toLowerCase() : null;
    }).filter(Boolean);

    const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    const filteredOpenTags = openTagNames.filter(tag => !selfClosing.includes(tag!));

    if (filteredOpenTags.length !== closeTagNames.length) {
      errors.push({
        line: 1,
        message: 'Mismatched opening and closing tags detected',
        type: 'error'
      });
    }

    if (html.includes('<>') || html.includes('</>')) {
      errors.push({
        line: 1,
        message: 'Empty tag detected',
        type: 'error'
      });
    }

    this._htmlErrors.set(errors);
  }

  private async validateCss(css: string): Promise<void> {
    const errors: EditorError[] = [];

    try {
      // Use w3c-css-validator for proper CSS validation
      const validationResult:ValidateTextResultWithWarnings = await <any> cssValidator.validateText(css,{
        medium: 'print',
        warningLevel: 0,
        timeout: 3000,
        profile: 'css3svg',
      });

      if (validationResult && validationResult.errors) {
        validationResult.errors.forEach((error: any) => {
          errors.push({
            line: error.line || 1,
            message: error.message || 'CSS validation error',
            type: 'error'
          });
        });
      }

      if (validationResult && validationResult.warnings) {
        validationResult.warnings.forEach((warning: any) => {
          errors.push({
            line: warning.line || 1,
            message: warning.message || 'CSS validation warning',
            type: 'warning'
          });
        });
      }
    } catch (validatorError) {
      // Fallback to basic validation if w3c-css-validator fails
      console.warn('CSS validator failed, using basic validation:', validatorError);

      // Check for unclosed braces as fallback
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;

      if (openBraces !== closeBraces) {
        errors.push({
          line: 1,
          message: 'Mismatched curly braces in CSS',
          type: 'error'
        });
      }

      // Basic property validation
      const lines = css.split('\n');
      let insideRule = false;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('/*') || trimmedLine.startsWith('//')) return;

        if (trimmedLine.includes('{')) insideRule = true;
        if (trimmedLine.includes('}')) insideRule = false;

        if (insideRule &&
            trimmedLine.includes(':') &&
            !trimmedLine.endsWith(';') &&
            !trimmedLine.endsWith('{') &&
            !trimmedLine.endsWith('}')) {
          errors.push({
            line: index + 1,
            message: 'Missing semicolon',
            type: 'warning'
          });
        }
      });
    }

    this._cssErrors.set(errors);
  }

  private validateJs(js: string): void {
    const errors: EditorError[] = [];
    console.log('JS code updated');
    try {
      new Function(js);
    } catch (error: any) {
      console.error('JS validation error:', error);
      errors.push({
        line: 1,
        message: `Syntax Error: ${error.message}`,
        type: 'error'
      });
    }

    this._jsErrors.set(errors);
  }
}
