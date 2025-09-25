import {
  ApplicationConfig, inject, provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import {provideMonacoEditor} from "@class2pen/monaco-editor";
import {MonacoEditorService} from "../modules/class-room";
import {PeerService} from "../common/peer/peer.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideMonacoEditor({
      baseUrl: '/assets/monaco/min/vs',
      defaultOptions: MonacoEditorService.defaultOptions,
      requireConfig: { preferScriptTags: true },
    }),
    provideAppInitializer(() => {
      const peer = inject(PeerService);
      peer.connectToPeerServer()
    })
  ],
};
