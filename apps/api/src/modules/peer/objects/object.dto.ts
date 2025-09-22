import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsUUID } from 'class-validator';

export class PeerObjectDto {
  @ApiProperty({ description: 'Unique identifier of the object' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Type discriminator for the object' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Arbitrary JSON payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiProperty({ description: 'User ID of the creator/owner' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Channel Type ID', required: false })
  @IsOptional()
  @IsString()
  channelTypeId?: string;

  @ApiProperty({ description: 'Channel ID to which this object belongs' })
  @IsString()
  channelId!: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt!: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt!: string;

  @ApiProperty({ description: 'Comments', type: [Object], required: false, default: [] })
  @IsArray()
  @IsOptional()
  comments?: any[];
}

export class CreatePeerObjectDto {
  @ApiProperty({ description: 'Type discriminator for the object' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Arbitrary JSON payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiProperty({ description: 'User ID of the creator/owner' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Channel Type ID', required: false })
  @IsOptional()
  @IsString()
  channelTypeId?: string;

  @ApiProperty({ description: 'Channel ID to which this object belongs' })
  @IsString()
  channelId!: string;

  @ApiProperty({ description: 'Comments', type: [Object], required: false, default: [] })
  @IsArray()
  @IsOptional()
  comments?: any[];
}

export class UpdatePeerObjectDto {
  @ApiProperty({ description: 'Type discriminator for the object', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Arbitrary JSON payload', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: 'Comments', type: [Object], required: false })
  @IsOptional()
  @IsArray()
  comments?: any[];
}
