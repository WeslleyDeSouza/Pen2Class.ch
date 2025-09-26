import {Route, Router} from '@angular/router';
import {inject} from "@angular/core";
import { RouteConstants as RC } from './route.constants';
import {UserStoreService} from "../common/store";
import {AdminClassRoomOverviewComponent} from "../modules/class-room/teacher";

const canActivate = () => {
  const router = inject(Router)
  const store = inject(UserStoreService)

  if(!store.getCurrentUser() ) {
    sessionStorage.setItem('redirectUrl', router.url)
    router.navigate(['/'])
    return false;
  }

  return true;
}

export const appRoutes: Route[] = [
  {
    path: RC.Paths.admin,
    loadComponent: () => import('../modules/class-room/teacher').then(m => m.AdminLayoutComponent),
    children:[
      {
        path: `${RC.Paths.classroom}/:${RC.Params.classRoomId}`,
        children:[
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('../modules/class-room/teacher').then(m => m.AdminClassRoomOverviewComponent)
          },
          {
            path: `${RC.Paths.lesson}/:${RC.Params.lessonId}`,
            loadComponent: () => import('../modules/class-room/teacher').then(m => m.AdminClassRoomLessonComponent),
            children:[
              {
                path:`${RC.Paths.user}/:${RC.Params.userId}`,
                children:[
                  {
                    path: RC.Paths.editor,
                    loadComponent: () => import('../modules/class-room').then(m => m.EditorComponent)
                  },
                  {
                    path: '',
                    pathMatch: 'full',
                    redirectTo: RC.Paths.editor,
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: RC.Paths.dashboard,
        loadComponent: () => import('../modules/class-room/teacher').then(m => m.AdminClassRoomItemComponent),
      },
      {
        path: 'classroom',
        pathMatch: 'full',
        redirectTo: RC.Paths.dashboard,
      } ,
      {
        path: '',
        pathMatch: 'full',
        redirectTo: RC.Paths.dashboard,
      }
    ],
    canActivate: [
      canActivate
    ]
  },
  {
    path: RC.Paths.classroom,
    loadComponent: () => import('../modules/class-room/layout/layout.component').then(m => m.ClassRoomLayout),
    children: [
      {
        path:`:${RC.Params.classRoomId}`,
        component:AdminClassRoomOverviewComponent,
        children: [
          {
           path: `${RC.Paths.lesson}/:${RC.Params.lessonId}`,
           children:[
            {
              path: RC.Paths.editor,
              loadComponent: () => import('../modules/class-room').then(m => m.EditorComponent)
            },
          ]
          },
        ]
      }
    ],
    canActivate: [
      canActivate
    ]
  },
  {
    path: RC.Paths.root,
    loadComponent: () => import('../modules/home').then(m => m.HomeComponent)
  },
];
