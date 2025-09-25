import {Controller, Post, Get, Body, Param, Delete, Put, NotFoundException} from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import {ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody} from "@nestjs/swagger";
import { CreateClassroomDto, JoinByCodeDto, JoinClassroomDto, LeaveClassroomDto, ClassroomDto, ClassroomMemberDto, JoinLeaveResponseDto, SuccessResponseDto } from './classroom.dto';

@ApiTags('Classrooms')
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly channelService: ClassroomService) {}

  @Put()
  @ApiOperation({ summary: 'Create a new classroom channel' })
  @ApiBody({ description: 'Channel creation payload', type: CreateClassroomDto })
  @ApiOkResponse({ description: 'Channel created successfully', type: ClassroomDto })
  async createChannel(@Body() body: CreateClassroomDto) {
    return this.channelService.createClassroom(body.name, body.description, body.createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'List all channels' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ClassroomDto] })
  async getAllChannels() {
    return this.channelService.getAllClassrooms();
  }

  @Get('with-permission/:userId')
  @ApiOperation({ summary: 'List channels the user can access (creator or member)' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ClassroomDto] })
  async getAllChannelsWithPermission(@Param('userId') userId: string) {
    // Return channels where the user is creator or a member
    return this.channelService.getAllClassroomsWithPermission(userId);
  }


  @Get(':classroomId')
  @ApiOperation({ summary: 'Get a channel by ID' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID' })
  @ApiOkResponse({ description: 'Classroom returned successfully', type: ClassroomDto })
  async getChannel(@Param('classroomId') classroomId: string) {
    return this.channelService.getClassroom(classroomId);
  }

  @Post(':classroomId/join')
  @ApiOperation({ summary: 'Join a classroom' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID to join' })
  @ApiBody({ description: 'Join classroom payload', type: JoinClassroomDto })
  @ApiOkResponse({ description: 'Joined classroom successfully', type: JoinLeaveResponseDto })
  async joinChannel(@Param('classroomId') classroomId: string, @Body() body: JoinClassroomDto) {
    return this.channelService.joinClassroom(classroomId, body.userId,  body.displayName);
  }

  @Post(':classroomId/leave')
  @ApiOperation({ summary: 'Leave a classroom' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID to leave' })
  @ApiBody({ description: 'Leave classroom payload', type: LeaveClassroomDto })
  @ApiOkResponse({ description: 'Left classroom successfully', type: JoinLeaveResponseDto })
  async leaveChannel(@Param('classroomId') classroomId: string, @Body() body: LeaveClassroomDto) {
    return this.channelService.leaveClassroom(classroomId, body.userId);
  }

  @Get(':classroomId/members')
  @ApiOperation({ summary: 'Get classroom members' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID' })
  @ApiOkResponse({ description: 'List of members returned successfully', type: [ClassroomMemberDto] })
  async getChannelMembers(@Param('classroomId') classroomId: string) {
    return this.channelService.getClassroomMembers(classroomId);
  }

  @Post('join-by-code')
  @ApiOperation({ summary: 'Join a channel by invite code' })
  @ApiBody({ description: 'Join by code payload', type: JoinByCodeDto })
  @ApiOkResponse({ description: 'Joined channel via code successfully', type: JoinLeaveResponseDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  async joinChannelByCode(@Body() body: JoinByCodeDto) {
    const channel = await this.channelService.getClassroomByCode(body.code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${body.code} not found`);
    }
    return this.channelService.joinClassroom(channel.id, body.userId,  body.displayName);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Get a channel by invite code' })
  @ApiParam({ name: 'code', type: 'string', description: 'Invite code' })
  @ApiOkResponse({ description: 'Channel returned successfully', type: ClassroomDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  async getChannelByCode(@Param('code') code: string) {
    const channel = await this.channelService.getClassroomByCode(code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${code} not found`);
    }
    return channel;
  }

  @Delete(':classroomId')
  @ApiOperation({ summary: 'Delete a classroom by ID' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID' })
  @ApiOkResponse({ description: 'Classroom deleted successfully', type: SuccessResponseDto })
  deleteChannel(@Param('classroomId') classroomId: string) {
    return this.channelService.deleteClassroom(classroomId);
  }
}
