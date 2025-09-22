import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ChannelService } from '../channels/channel.service';
import {ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiBody} from "@nestjs/swagger";
import {SignupUserDto, UserChannelDto, UserDto} from './user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiBody({ description: 'Signup payload', type: SignupUserDto })
  @ApiOkResponse({ description: 'User created successfully', type: UserDto })
  signup(@Body() body: SignupUserDto) {
    return this.userService.createUser(body.username, body.email, body.displayName);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'List of users returned successfully', type: [UserDto] })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('self/:userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'User returned successfully', type: UserDto })
  getCurrentUser(@Param('userId') userId: string) {
    // todo implement get current user
    return this.userService.getUser(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'User returned successfully', type: UserDto })
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Get(':userId/channels')
  @ApiOperation({ summary: 'List channels that a user has joined' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'List of channels for the user returned successfully', type: [UserChannelDto] })
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
