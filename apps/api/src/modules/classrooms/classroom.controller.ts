import {Controller, Post, Get, Body, Param, Delete, Put, NotFoundException} from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import {ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody} from "@nestjs/swagger";
import { CreateClassroomDto, UpdateClassroomDto, JoinByCodeDto, JoinClassroomDto, LeaveClassroomDto, ClassroomDto, ClassroomMemberDto, JoinLeaveResponseDto, SuccessResponseDto } from './classroom.dto';

@ApiTags('Classrooms')
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly channelService: ClassroomService) {}

  @Put()
  @ApiOperation({ summary: 'Create a new classroom channel' })
  @ApiBody({ description: 'Channel creation payload', type: CreateClassroomDto })
  @ApiOkResponse({ description: 'Channel created successfully', type: ClassroomDto })
  async create(@Body() body: CreateClassroomDto) {
    return this.channelService.createClassroom(body.name, body.description, body.createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'List all channels' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ClassroomDto] })
  async getAll() {
    return this.channelService.getAllClassrooms();
  }

  @Get('byUser/:userId')
  @ApiOperation({ summary: 'List channels the user can access (creator or member)' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ClassroomDto] })
  async getAllFromUser(@Param('userId') userId: string) {
    return this.channelService.getAllClassroomsByUser(userId)
  }

  @Get(':classroomId')
  @ApiOperation({ summary: 'Get a channel by ID' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID' })
  @ApiOkResponse({ description: 'Classroom returned successfully', type: ClassroomDto })
  async get(@Param('classroomId') classroomId: string) {
    return this.channelService.getClassroom(classroomId);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update a classroom' })
  @ApiBody({ description: 'Update classroom payload', type: UpdateClassroomDto })
  @ApiOkResponse({ description: 'Classroom updated successfully', type: ClassroomDto })
  async update(@Body() body: UpdateClassroomDto) {
    return this.channelService.updateClassroom(body.id, body.name, body.description, body.configuration);
  }

  @Post(':classroomId/join')
  @ApiOperation({ summary: 'Join a classroom' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID to join' })
  @ApiBody({ description: 'Join classroom payload', type: JoinClassroomDto })
  @ApiOkResponse({ description: 'Joined classroom successfully', type: JoinLeaveResponseDto })
  async joinById(@Param('classroomId') classroomId: string, @Body() body: JoinClassroomDto) {
    return this.channelService.joinClassroomByCode(classroomId, body.userId,  body.displayName);
  }

  @Post(':classroomId/leave')
  @ApiOperation({ summary: 'Leave a classroom' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID to leave' })
  @ApiBody({ description: 'Leave classroom payload', type: LeaveClassroomDto })
  @ApiOkResponse({ description: 'Left classroom successfully', type: JoinLeaveResponseDto })
  async leave(@Param('classroomId') classroomId: string, @Body() body: LeaveClassroomDto) {
    return this.channelService.leaveClassroom(classroomId, body.userId);
  }

  @Get(':classroomId/members')
  @ApiOperation({ summary: 'Get classroom members' })
  @ApiParam({ name: 'classroomId', type: 'string', description: 'Classroom ID' })
  @ApiOkResponse({ description: 'List of members returned successfully', type: [ClassroomMemberDto] })
  async getMembers(@Param('classroomId') classroomId: string) {
    return this.channelService.getClassroomMembers(classroomId);
  }

  @Post('join-by-code')
  @ApiOperation({ summary: 'Join a channel by invite code' })
  @ApiBody({ description: 'Join by code payload', type: JoinByCodeDto })
  @ApiOkResponse({ description: 'Joined channel via code successfully', type: JoinLeaveResponseDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  async joinByCode(@Body() body: JoinByCodeDto) {
    const channel = await this.channelService.getClassroomByCode(body.code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${body.code} not found`);
    }
    return this.channelService.joinClassroomByCode(channel.code, body.userId,  body.displayName);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Get a channel by invite code' })
  @ApiParam({ name: 'code', type: 'string', description: 'Invite code' })
  @ApiOkResponse({ description: 'Channel returned successfully', type: ClassroomDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  async getByCode(@Param('code') code: string) {
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
  delete(@Param('classroomId') classroomId: string) {
    return this.channelService.deleteClassroom(classroomId);
  }
}
