import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../modules/home').then(m => m.HomeComponent)
  },
  {
    path: 'test/editor',
    loadComponent: () => import('../modules/class-room').then(m => m.EditorComponent)
  },
  {
    path: 'class-room/editor',
    loadComponent: () => import('../modules/class-room').then(m => m.EditorComponent)
  }
];
