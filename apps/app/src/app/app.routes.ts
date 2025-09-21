import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../modules/peer/devUtils/peer-classroom-test.component').then(m => m.PeerClassroomTestComponent)
  },
  {
    path: 'peer-test',
    loadComponent: () => import('../modules/peer/devUtils/peer-test.component').then(m => m.PeerTestComponent)
  }
];
