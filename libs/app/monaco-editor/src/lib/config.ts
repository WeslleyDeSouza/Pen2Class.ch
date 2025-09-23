import { InjectionToken } from '@angular/core';

export const NGX_MONACO_EDITOR_CONFIG = new InjectionToken('NGX_MONACO_EDITOR_CONFIG');

export interface NgxMonacoEditorConfig {

  baseUrl?: string;
  requireConfig?: any;
  onMonacoLoad?: (monaco?: any) => void;
  monacoRequire?: any;
  // Additional @monaco-editor/loader specific options
  loaderUrl?: string;
  cdnUrl?: string;
  locale?: string;
  defaultOptions?:{ [key: string]: any; };
}
