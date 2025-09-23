import {makeEnvironmentProviders, provideAppInitializer} from '@angular/core';
import loader from '@monaco-editor/loader';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from './config';

export function provideMonacoEditor(config: NgxMonacoEditorConfig = {}) {
  return makeEnvironmentProviders([
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: config },
    // Fixed Monaco Editor App Initializer
    provideAppInitializer(() => {
      // No async loading needed - just configure Monaco
      if ((window as any).monaco) {
        if (config.onMonacoLoad) {
          config.onMonacoLoad((window as any).monaco);
        }
      }
      return Promise.resolve();
    })
  ]);
}
