import {makeEnvironmentProviders, provideAppInitializer} from '@angular/core';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from './config';

export function provideMonacoEditor(config: NgxMonacoEditorConfig = {}) {
  return makeEnvironmentProviders([
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: config }

    ,provideAppInitializer(()=> {
       return new Promise<void>(async (resolve: any) => {
         if (typeof ((<any>window).monaco) === 'object') {
           resolve();
           return;
         }

          let baseUrl = config.baseUrl;

          // ensure backward compatibility
          if (baseUrl === "assets" || !baseUrl) {
            baseUrl = "./assets/monaco/min/vs";
          }

          const onGotAmdLoader: any = async (require?: any) => {
            let usedRequire = require || (<any>window).require;
            let requireConfig = { paths: { vs: `${baseUrl}` } };
            Object.assign(requireConfig, config.requireConfig || {});

            // Load monaco
            usedRequire.config(requireConfig);
            usedRequire([`vs/editor/editor.main`], () => {
              if (typeof config.onMonacoLoad === 'function') {
                config.onMonacoLoad();
              }

              return
            });
          };

          if (config.monacoRequire) {
            await onGotAmdLoader(config.monacoRequire);
            return resolve(true);
            // Load AMD loader if necessary
          }
          else if (!(<any>window).require) {
            const loaderScript: HTMLScriptElement = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = `${baseUrl}/loader.js`;
            loaderScript.addEventListener('load', () => { onGotAmdLoader(); });
            document.body.appendChild(loaderScript);
            resolve(true);
            // Load AMD loader without over-riding node's require
          }
          else if (!(<any>window).require.config) {
            var src = `${baseUrl}/loader.js`;

            var loaderRequest = new XMLHttpRequest();
            loaderRequest.addEventListener("load", () => {
              let scriptElem = document.createElement('script');
              scriptElem.type = 'text/javascript';
              scriptElem.text = [
                // Monaco uses a custom amd loader that over-rides node's require.
                // Keep a reference to node's require so we can restore it after executing the amd loader file.
                'var nodeRequire = require;',
                loaderRequest.responseText.replace('"use strict";', ''),
                // Save Monaco's amd require and restore Node's require
                'var monacoAmdRequire = require;',
                'require = nodeRequire;',
                'require.nodeRequire = require;'
              ].join('\n');
              document.body.appendChild(scriptElem);
              onGotAmdLoader((<any>window).monacoAmdRequire).then(()=> resolve(true));
            });
            loaderRequest.open("GET", src);
            loaderRequest.send();
          }
          else {
            await onGotAmdLoader().finally(()=> resolve(true))
          }
        });
    })
  ]);
}
