import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Lecture' })
  @IsString()
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Live instructor-led session', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  createdBy!: string; // channel owner creating this
}

export class UpdateLessonDto {
  @ApiProperty({ example: 'Workshop', required: false })
  @IsOptional()
  @IsString()
  @Expose()
  name?: string;

  @ApiProperty({ example: 'Hands-on session', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}

export class ToggleLessonDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @Expose()
  enabled!: boolean;

  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  requestedBy!: string; // must be owner
}

export class StartQuitLessonDto {
  @ApiProperty({ example: 'user_456' })
  @IsString()
  @Expose()
  userId!: string;
}

export class LessonDto {
  @ApiProperty({ example: 'f82b0a0d-0d6a-4b63-8b15-1a6e4f1e6f8f' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Lecture' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Live instructor-led session', required: false, nullable: true })
  @Expose()
  description?: string;

  @ApiProperty({ example: true })
  @Expose()
  enabled!: boolean;

  @ApiProperty({ example: 'user_123' })
  @Expose()
  createdBy!: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T12:30:00.000Z', type: String })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({ example: '8f14e45f-ea9a-4b0a-9b7d-1234567890ab' })
  @Expose()
  classroomId!: string;
}

export class SuccessDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;
}