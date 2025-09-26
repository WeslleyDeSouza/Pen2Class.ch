import { Injectable } from '@angular/core';

export type MonacoLanguage = 'html' | 'css' | 'javascript';

@Injectable({
  providedIn: 'root'
})
export class MonacoEditorService {

  getDefaultEditorOptions(language: MonacoLanguage): any {
    return {
     ... MonacoEditorService.defaultOptions,
      language: (language === 'javascript' ? 'javascript' : language),
    };
  }

  static defaultOptions =  {
    language: 'javascript',
    theme: 'vs-dark-custom',
    fontSize: 14,
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    renderWhitespace: 'boundary',
    renderControlCharacters: false,
    renderLineHighlight: 'line',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: { enabled: true },
    folding: true,
    foldingHighlight: true,
    unfoldOnClickAfterEndOfLine: false,
    selectionHighlight: true,
    occurrencesHighlight: 'singleFile',
    codeLens: false,
    lightbulb: { enabled: true },
    contextmenu: true,
    mouseWheelZoom: false,
    multiCursorModifier: 'ctrlCmd',
    accessibilitySupport: 'auto'
  };
}
