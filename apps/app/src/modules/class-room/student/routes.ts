import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard.component';
import {RouteConstants as RC, RouteConstants} from "../../../app/route.constants";

export const routesStudent: Routes = [
  {
    path: `${RouteConstants.Paths.classroom}/:${RouteConstants.Params.classRoomId}`,
    loadComponent: () => import('./student-classroom.component').then(m => m.StudentClassroomComponent),
    data: { title: 'Classroom' }
  },
  {
    path: `${RouteConstants.Paths.classroom}/:${RouteConstants.Params.classRoomId}/${RouteConstants.Paths.lesson}/:${RouteConstants.Params.lessonId}`,
    loadComponent: () => import('./student-lesson.component').then(m => m.StudentLessonComponent),
    data: { title: 'Lesson' },
    children:[
      {
        path: '',
        loadComponent: () => import('../components/editor').then(m => m.EditorComponent)
      },
    ]
  },
  {
    path: `${RouteConstants.Paths.classroom}/:${RouteConstants.Params.classRoomId}/exams`,
    loadComponent: () => import('./student-exam-overview.component').then(m => m.StudentExamOverviewComponent),
    data: { title: 'Exams' }
  },
  {
    path: '',
    component: StudentDashboardComponent,
    data: { title: 'Student Dashboard' },
    children: []
  },
];
