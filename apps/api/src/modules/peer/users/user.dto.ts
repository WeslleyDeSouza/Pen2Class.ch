import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, IsString, IsEmail, IsNumber} from 'class-validator';
import {Expose, Type} from 'class-transformer';
import {ChannelMemberDto} from "../channels/channel.dto";

// Request DTOs
export class SignupUserDto {
  @ApiProperty({ example: 'jdoe' })
  @IsString()
  @Expose()
  username!: string;

  @ApiProperty({ example: 'jdoe@example.com', required: false, nullable: true })
  @IsOptional()
  @IsEmail()
  @Expose()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  displayName?: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  type: number;
}

// Response DTOs
export class UserDto {
  @ApiProperty({ example: '8f14e45f-ea9a-4b0a-9b7d-1234567890ab' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'jdoe' })
  @Expose()
  username!: string;

  @ApiProperty({ example: 'jdoe@example.com', required: false, nullable: true })
  @Expose()
  email?: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  displayName!: string;

  @ApiProperty()
  @IsOptional()
  @Expose()
  type?: number;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  createdAt!: Date;
}


export class UserChannelDto {
  @ApiProperty({ example: '8f14e45f-ea9a-4b0a-9b7d-1234567890ab' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Math 101' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Algebra basics', required: false, nullable: true })
  @Expose()
  description?: string;

  @ApiProperty({ example: 'user_123' })
  @Expose()
  createdBy!: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: () => [ChannelMemberDto] })
  @Type(() => ChannelMemberDto)
  @Expose()
  members!: ChannelMemberDto[];

  @ApiProperty({ example: '123456' })
  @Expose()
  code!: string;
}
