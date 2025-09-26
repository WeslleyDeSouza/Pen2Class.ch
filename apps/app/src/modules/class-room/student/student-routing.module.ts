import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: StudentDashboardComponent,
    data: { title: 'Student Dashboard' }
  },
  {
    path: 'classroom/:classroomId',
    loadComponent: () => import('./student-classroom.component').then(m => m.StudentClassroomComponent),
    data: { title: 'Classroom' }
  },
  {
    path: 'classroom/:classroomId/lesson/:lessonId',
    loadComponent: () => import('./student-lesson.component').then(m => m.StudentLessonComponent),
    data: { title: 'Lesson' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }