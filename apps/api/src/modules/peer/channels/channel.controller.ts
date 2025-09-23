import {Controller, Post, Get, Body, Param, Delete, Put, NotFoundException} from '@nestjs/common';
import { ChannelService } from './channel.service';
import {ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody} from "@nestjs/swagger";
import { CreateChannelDto, JoinByCodeDto, JoinChannelDto, LeaveChannelDto, ChannelDto, ChannelMemberDto, JoinLeaveResponseDto, SuccessResponseDto } from './channel.dto';

@ApiTags('Channel')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Put()
  @ApiOperation({ summary: 'Create a new classroom channel' })
  @ApiBody({ description: 'Channel creation payload', type: CreateChannelDto })
  @ApiOkResponse({ description: 'Channel created successfully', type: ChannelDto })
  createChannel(@Body() body: CreateChannelDto) {
    return this.channelService.createChannel(body.name, body.description, body.createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'List all channels' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ChannelDto] })
  getAllChannels() {
    return this.channelService.getAllChannels();
  }

  @Get('with-permission/:userId')
  @ApiOperation({ summary: 'List channels the user can access (creator or member)' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'List of channels returned successfully', type: [ChannelDto] })
  getAllChannelsWithPermission(@Param('userId') userId: string) {
    // Return channels where the user is creator or a member
    return this.channelService.getAllChannelsWithPermission(userId);
  }


  @Get(':channelId')
  @ApiOperation({ summary: 'Get a channel by ID' })
  @ApiParam({ name: 'channelId', type: 'string', description: 'Channel ID' })
  @ApiOkResponse({ description: 'Channel returned successfully', type: ChannelDto })
  getChannel(@Param('channelId') channelId: string) {
    return this.channelService.getChannel(channelId);
  }

  @Post(':channelId/join')
  @ApiOperation({ summary: 'Join a channel' })
  @ApiParam({ name: 'channelId', type: 'string', description: 'Channel ID to join' })
  @ApiBody({ description: 'Join channel payload', type: JoinChannelDto })
  @ApiOkResponse({ description: 'Joined channel successfully', type: JoinLeaveResponseDto })
  joinChannel(@Param('channelId') channelId: string, @Body() body: JoinChannelDto) {
    return this.channelService.joinChannel(channelId, body.userId, body.peerId, body.displayName);
  }

  @Post(':channelId/leave')
  @ApiOperation({ summary: 'Leave a channel' })
  @ApiParam({ name: 'channelId', type: 'string', description: 'Channel ID to leave' })
  @ApiBody({ description: 'Leave channel payload', type: LeaveChannelDto })
  @ApiOkResponse({ description: 'Left channel successfully', type: JoinLeaveResponseDto })
  leaveChannel(@Param('channelId') channelId: string, @Body() body: LeaveChannelDto) {
    return this.channelService.leaveChannel(channelId, body.userId);
  }

  @Get(':channelId/members')
  @ApiOperation({ summary: 'Get channel members' })
  @ApiParam({ name: 'channelId', type: 'string', description: 'Channel ID' })
  @ApiOkResponse({ description: 'List of members returned successfully', type: [ChannelMemberDto] })
  getChannelMembers(@Param('channelId') channelId: string) {
    return this.channelService.getChannelMembers(channelId);
  }

  @Post('join-by-code')
  @ApiOperation({ summary: 'Join a channel by invite code' })
  @ApiBody({ description: 'Join by code payload', type: JoinByCodeDto })
  @ApiOkResponse({ description: 'Joined channel via code successfully', type: JoinLeaveResponseDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  joinChannelByCode(@Body() body: JoinByCodeDto) {
    const channel = this.channelService.getChannelByCode(body.code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${body.code} not found`);
    }
    return this.channelService.joinChannel(channel.id, body.userId, body.peerId, body.displayName);
  }

  @Get('by-code/:code')
  @ApiOperation({ summary: 'Get a channel by invite code' })
  @ApiParam({ name: 'code', type: 'string', description: 'Invite code' })
  @ApiOkResponse({ description: 'Channel returned successfully', type: ChannelDto })
  @ApiNotFoundResponse({ description: 'Classroom with the provided code not found' })
  getChannelByCode(@Param('code') code: string) {
    const channel = this.channelService.getChannelByCode(code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${code} not found`);
    }
    return channel;
  }

  @Delete(':channelId')
  @ApiOperation({ summary: 'Delete a channel by ID' })
  @ApiParam({ name: 'channelId', type: 'string', description: 'Channel ID' })
  @ApiOkResponse({ description: 'Channel deleted successfully', type: SuccessResponseDto })
  deleteChannel(@Param('channelId') channelId: string) {
    return this.channelService.deleteChannel(channelId);
  }
}
