import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { ClassroomEntity } from './classroom.entity';
import { ClassroomMemberEntity } from './classroom-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassroomEntity, ClassroomMemberEntity])],
  providers: [ClassroomService],
  controllers: [ClassroomController, ],
  exports: [ClassroomService],
})
export class ClassroomsModule {}
