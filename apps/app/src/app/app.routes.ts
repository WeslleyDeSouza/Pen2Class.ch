import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../modules/home').then(m => m.HomeComponent)
  },
];
