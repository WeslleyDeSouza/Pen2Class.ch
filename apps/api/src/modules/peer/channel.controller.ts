import {Controller, Post, Get, Body, Param, Delete, Put, NotFoundException} from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Put()
  createChannel(@Body() body: { name: string; description?: string; createdBy: string }) {
    return this.channelService.createChannel(body.name, body.description, body.createdBy);
  }

  @Get()
  getAllChannels() {
    return this.channelService.getAllChannels();
  }

  @Get(':channelId')
  getChannel(@Param('channelId') channelId: string) {
    return this.channelService.getChannel(channelId);
  }

  @Post(':channelId/join')
  joinChannel(@Param('channelId') channelId: string, @Body() body: { userId: string; peerId: string }) {
    return this.channelService.joinChannel(channelId, body.userId, body.peerId);
  }

  @Post(':channelId/leave')
  leaveChannel(@Param('channelId') channelId: string, @Body() body: { userId: string }) {
    return this.channelService.leaveChannel(channelId, body.userId);
  }

  @Get(':channelId/members')
  getChannelMembers(@Param('channelId') channelId: string) {
    return this.channelService.getChannelMembers(channelId);
  }

  @Post('join-by-code')
  joinChannelByCode(@Body() body: { code: string; userId: string; peerId: string }) {
    const channel = this.channelService.getChannelByCode(body.code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${body.code} not found`);
    }
    return this.channelService.joinChannel(channel.id, body.userId, body.peerId);
  }

  @Get('by-code/:code')
  getChannelByCode(@Param('code') code: string) {
    const channel = this.channelService.getChannelByCode(code);
    if (!channel) {
      throw new NotFoundException(`Classroom with code ${code} not found`);
    }
    return channel;
  }

  @Delete(':channelId')
  deleteChannel(@Param('channelId') channelId: string) {
    return this.channelService.deleteChannel(channelId);
  }
}
