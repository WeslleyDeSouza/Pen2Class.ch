import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ClassroomsModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
