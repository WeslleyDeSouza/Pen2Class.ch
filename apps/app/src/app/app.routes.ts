import {Route, Router} from '@angular/router';
import {inject} from "@angular/core";
import {RouteConstants, RouteConstants as RC} from './route.constants';
import {UserStoreService} from "../common/store";
import {AdminClassRoomOverviewComponent} from "../modules/class-room/teacher";
import {routesStudent} from "../modules/class-room/student/routes";

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
          },
          {
            path: `${RC.Paths.exam}/:${RC.Params.examId}/${RC.Paths.results}`,
            loadComponent: () => import('../modules/class-room/teacher/components/exam-results.component').then(m => m.ExamResultsComponent)
          }
        ]
      },
      {
        path: RC.Paths.dashboard,
        loadComponent: () => import('../modules/class-room/teacher').then(m => m.AdminClassTeacherOverviewComponent),
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
    path: RouteConstants.Paths.student,
    children: routesStudent,
    canActivate: [
      canActivate
    ]
  },




  {
    path: RC.Paths.root,
    loadComponent: () => import('../modules/home').then(m => m.HomeComponent)
  },
];
