import { Module } from '@nestjs/common';
import { CoreStaticFileLandingPageModule, CoreStaticFileModule } from '../core/static-file';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env['DB_TYPE'] as any ,
      database: process.env['DB_DATABASE'],
      autoLoadEntities: true,
      synchronize: true, // process.env['APP_ENV'] !== 'production'
    }),
    ClassroomsModule,
    UsersModule,
    LessonsModule,
    ResourcesModule,
    CoreStaticFileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

@Module({
  imports: [CoreStaticFileLandingPageModule],
  controllers: [],
  providers: [],
})
export class AppLandingPageModule {}
