import {Route, Router} from '@angular/router';
import {ClassRoomLayout} from "../modules/class-room/layout/layout.component";
import {inject} from "@angular/core";
import {PeerUserStoreService} from "../common/services/peer.service";

const canActivate = () => {
  const router = inject(Router)
  const store = inject(PeerUserStoreService)
  if(!store.getCurrentUser() || store.userPeerId()) {
    router.navigate(['/'])
    return false;
  }
  return true;

}

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('../modules/home').then(m => m.HomeComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('../modules/class-room/admin').then(m => m.AdminDashboardComponent),
    canActivate: [
      canActivate
    ]
  },
  {
    path:'class-room',
    loadComponent: () => import('../modules/class-room/layout/layout.component').then(m => m.ClassRoomLayout),
    children: [
      {
        path: 'lesson/:lessonId/editor',
        loadComponent: () => import('../modules/class-room').then(m => m.EditorComponent)
      },
    ],
    canActivate: [
      canActivate
    ]
  },
];
