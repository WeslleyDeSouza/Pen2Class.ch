import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsEnum } from 'class-validator';
import { ResourceType } from './resource.entity';

export class ResourceDto {
  @ApiProperty({ description: 'Unique identifier of the object' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Resource type', enum: ResourceType, enumName: 'ResourceType' })
  @IsEnum(ResourceType)
  type!: ResourceType;

  @ApiProperty({ description: 'Arbitrary JSON payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiProperty({ description: 'User ID of the creator/owner' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Lesson ID', required: false })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ description: 'Classroom ID to which this object belongs' })
  @IsString()
  classroomId!: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt!: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt!: string;

  @ApiProperty({ description: 'Comments', type: [Object], required: false, default: [] })
  @IsArray()
  @IsOptional()
  comments?: any[];
}

export class CreateResourceDto {
  @ApiProperty({ description: 'Resource type', enum: ResourceType, enumName: 'ResourceType' })
  @IsEnum(ResourceType)
  type!: ResourceType;

  @ApiProperty({ description: 'Arbitrary JSON payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiProperty({ description: 'User ID of the creator/owner' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Lesson ID', required: false })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiProperty({ description: 'Classroom ID to which this object belongs' })
  @IsString()
  classroomId!: string;

  @ApiProperty({ description: 'Comments', type: [Object], required: false, default: [] })
  @IsArray()
  @IsOptional()
  comments?: any[];
}

export class UpdateResourceDto {
  @ApiProperty({ description: 'Resource type', enum: ResourceType, enumName: 'ResourceType', required: false })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiProperty({ description: 'Arbitrary JSON payload', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: 'Comments', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  comments?: any[];
}
