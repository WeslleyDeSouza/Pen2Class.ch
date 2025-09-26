import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from './user.entity';
import { UserSessionEntity } from './user-session.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClassroomsModule } from '../classrooms/classrooms.module';
import {UserJwtService} from "./jwt.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserSessionEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '24h' }
    }),
    ClassroomsModule
  ],
  providers: [UserService,UserJwtService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
