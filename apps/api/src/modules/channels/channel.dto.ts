import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

// Request DTOs
export class CreateChannelDto {
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

export class JoinChannelDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @Expose()
  userId!: string;

  @ApiProperty({ example: 'user_displayName' })
  @IsOptional()
  @Expose()
  displayName!: string;

}

export class LeaveChannelDto {
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
export class ChannelMemberDto {
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

export class ChannelDto {
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

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;
}

export class JoinLeaveResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;

  @ApiProperty({ type: () => ChannelDto })
  @Type(() => ChannelDto)
  @Expose()
  channel!: ChannelDto;
}
