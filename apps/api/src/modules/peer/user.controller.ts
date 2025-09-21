import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ChannelService } from './channel.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService
  ) {}

  @Post('signup')
  signup(@Body() body: { username: string; email?: string; displayName?: string }) {
    return this.userService.createUser(body.username, body.email, body.displayName);
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':userId')
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Get(':userId/channels')
  getUserChannels(@Param('userId') userId: string) {
    // Verify user exists
    this.userService.getUser(userId);

    // Get all channels and filter by membership
    const allChannels = this.channelService.getAllChannels();
    return allChannels.filter(channel =>
      channel.members.some(member => member.userId === userId)
    );
  }
}