import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../modules/peer/devUtils/peer-classroom-user-test.component').then(m => m.PeerClassroomUserTestComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('../modules/peer/devUtils/peer-classroom-admin-test.component').then(m => m.PeerClassroomAdminTestComponent)
  },
  {
    path: 'peer-test',
    loadComponent: () => import('../modules/peer/devUtils/peer-test.component').then(m => m.PeerTestComponent)
  }
];
