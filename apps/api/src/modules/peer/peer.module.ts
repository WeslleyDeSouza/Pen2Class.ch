import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerService } from './peer.service';
import { ClassroomService } from '../classrooms/classroom.service';
import { UserService } from '../users/user.service';
import { ClassroomController } from '../classrooms/classroom.controller';
import { UserController } from '../users/user.controller';
import { LessonService } from '../lessons/lesson.service';
import { LessonController } from '../lessons/lesson.controller';
import { ResourceService } from '../resources/resource.service';
import { ResourceController } from '../resources/resource.controller';
import { UserEntity } from '../users/user.entity';
import { ClassroomEntity } from '../classrooms/classroom.entity';
import { ClassroomMemberEntity } from '../classrooms/classroom-member.entity';
import { ResourceEntity } from '../resources/resource.entity';
import { LessonEntity } from '../lessons/lesson.entity';
import { LessonTemplateEntity } from '../lessons/lesson-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ClassroomEntity, ClassroomMemberEntity, ResourceEntity, LessonEntity, LessonTemplateEntity]),
  ],
  exports: [PeerService]
})
export class PeerModule {}
