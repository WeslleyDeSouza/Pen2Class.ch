import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { LessonDto } from "../lessons/lesson.dto";

// Request DTOs
export class CreateClassroomDto {
  @ApiProperty({ example: 'Math 101' })
  @IsString()
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Algebra basics', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  createdBy!: string;
}

export class UpdateClassroomDto {
  @ApiProperty({ example: 'Math 101' })
  @IsString()
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Math 101' })
  @IsString()
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Algebra basics', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty({ example: 'Configuration of Classroom', required: false, nullable: true })
  @IsOptional()
  @Expose()
  configuration!: Record<string, any>;
}

export class JoinClassroomDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'user_displayName' })
  @IsOptional()
  @Expose()
  displayName!: string;

}

export class LeaveClassroomDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  userId!: string;
}

export class JoinByCodeDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @Expose()
  code!: string;

  @ApiProperty({ example: 'Michael' })
  @IsOptional()
  @Expose()
  displayName!: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  userId!: string;
}

// Response DTOs (for Swagger types)
export class ClassroomMemberDto {
  @ApiProperty({ example: 'user_123' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'user_DisplayName' })
  @Expose()
  displayName!: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  joinedAt!: Date;
}

export class ClassroomDto {
  @ApiProperty({ example: '8f14e45f-ea9a-4b0a-9b7d-1234567890ab' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Math 101' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Algebra basics', required: false, nullable: true })
  @Expose()
  description?: string;

  @ApiProperty({ example: 'Configuration of Classroom', required: false, nullable: true })
  @Expose()
  configuration!: Record<string, any>;


  @ApiProperty({ example: 'user_123' })
  @Expose()
  createdBy!: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: () => [ClassroomMemberDto] })
  @Type(() => ClassroomMemberDto)
  @Expose()
  members!: ClassroomMemberDto[];

  @ApiProperty({ type: () => [LessonDto] })
  @Type(() => LessonDto)
  @Expose()
  lessons!: LessonDto[] ;

  @ApiProperty({ example: '123456' })
  @Expose()
  code!: string;
}

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;
}

export class JoinLeaveResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;

  @ApiProperty({ type: () => ClassroomDto })
  @Type(() => ClassroomDto)
  @Expose()
  classroom!: ClassroomDto;
}
