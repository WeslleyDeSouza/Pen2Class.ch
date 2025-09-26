import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentRoutingModule } from './student-routing.module';
import { StudentDashboardComponent } from './student-dashboard.component';
import { StudentClassCardComponent } from './components/student-class-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StudentRoutingModule,
    // Import standalone components
    StudentDashboardComponent,
    StudentClassCardComponent
  ],
  providers: []
})
export class StudentModule { }