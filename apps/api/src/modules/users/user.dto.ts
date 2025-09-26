import { ApiProperty } from '@nestjs/swagger';
import {IsOptional, IsString, IsEmail, IsNumber, MinLength} from 'class-validator';
import {Expose, Type} from 'class-transformer';
import {ClassroomMemberDto} from "../classrooms/classroom.dto";

// Request DTOs
export class SignupUserDto {
  @ApiProperty({ example: 'jdoe@example.com' })
  @IsEmail()
  @Expose()
  username!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  @Expose()
  password!: string;

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

export class LoginUserDto {
  @ApiProperty({ example: 'jdoe@example.com' })
  @IsEmail()
  @Expose()
  username!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @Expose()
  password!: string;
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

export class UserSessionDto {
  @ApiProperty({ example: '8f14e45f-ea9a-4b0a-9b7d-1234567890ab' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'abc123def456' })
  @Expose()
  sessionToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken!: string;

  @ApiProperty({ example: '2025-01-31T12:00:00.000Z', type: String })
  @Expose()
  expiresAt!: Date;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @Expose()
  userAgent?: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @Expose()
  ipAddress?: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', type: String })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-01T13:00:00.000Z', type: String, required: false })
  @Expose()
  lastUsedAt?: Date;
}

export class LoginResponseDto {
  @ApiProperty({ type: () => UserDto })
  @Type(() => UserDto)
  @Expose()
  user!: UserDto;

  @ApiProperty({ type: () => UserSessionDto })
  @Type(() => UserSessionDto)
  @Expose()
  session!: UserSessionDto;
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

  @ApiProperty({ type: () => [ClassroomMemberDto] })
  @Type(() => ClassroomMemberDto)
  @Expose()
  members!: ClassroomMemberDto[];

  @ApiProperty({ example: '123456' })
  @Expose()
  code!: string;
}
