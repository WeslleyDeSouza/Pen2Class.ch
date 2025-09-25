import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonEntity } from './lesson.entity';
import { LessonTemplateEntity } from './lesson-template.entity';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  imports: [ClassroomsModule, TypeOrmModule.forFeature([LessonEntity, LessonTemplateEntity])],
  providers: [LessonService],
  controllers: [LessonController ],
  exports: [LessonService],
})
export class LessonsModule {}
