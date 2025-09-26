import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsEnum } from 'class-validator';
import { ResourceType } from './resource.entity';
import {Expose} from "class-transformer";

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

  @ApiProperty({ example: 'Configuration', required: false, nullable: true })
  @IsOptional()
  @Expose()
  configuration!: Record<string, any>;

  static convert(obj){
    return Object.assign(new ResourceDto(),{
      id: obj.id,
      type: obj.type,
      data: obj.data,
      userId: obj.userId,
      lessonId: obj.lessonId,
      classroomId: obj.classroomId,
      configuration: obj.configuration,
      comments: obj.comments || [],
      createdAt: obj.createdAt instanceof Date ?  obj.createdAt.toISOString() : obj.createdAt,
      updatedAt: obj.updatedAt instanceof Date ?  obj.updatedAt.toISOString() : obj.updatedAt,
    })
  }
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

  @ApiProperty({ example: 'Configuration', required: false, nullable: true })
  @IsOptional()
  @Expose()
  configuration!: Record<string, any>;
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


  @ApiProperty({ example: 'Configuration ', required: false, nullable: true })
  @IsOptional()
  @Expose()
  configuration!: Record<string, any>;
}
