import { Controller, Post, Get, Body, Param, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { ClassroomService } from '../classrooms/classroom.service';
import {ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiBody} from "@nestjs/swagger";
import {SignupUserDto, UserChannelDto, UserDto, LoginUserDto, LoginResponseDto} from './user.dto';
import { UserJwtService } from './jwt.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly classroomService: ClassroomService,
    private readonly jwtService: UserJwtService
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user (signup)' })
  @ApiBody({ description: 'Signup payload', type: SignupUserDto })
  @ApiOkResponse({ description: 'User created successfully', type: LoginResponseDto })
  async signup(@Body() body: SignupUserDto): Promise<LoginResponseDto> {
    const user = await this.userService.createUser(body.username, body.password, body.email, body.displayName, body.type);
    const session = await this.userService.createSession(user.id);
    const accessToken = await this.jwtService.generateAccessToken(user);

    return {
      user,
      session: {
        ...session,
        accessToken
      }
    } as LoginResponseDto;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ description: 'Login payload', type: LoginUserDto })
  @ApiOkResponse({ description: 'Login successful', type: LoginResponseDto })
  async login(@Body() body: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.userService.validateUser(body.username, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.userService.createSession(user.id);
    const accessToken = await this.jwtService.generateAccessToken(user);

    return {
      user,
      session: {
        ...session,
        accessToken
      }
    } as LoginResponseDto;
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'List of users returned successfully', type: [UserDto] })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('self/:userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'User returned successfully', type: UserDto })
  async getCurrentUser(@Param('userId') userId: string) {
    // todo implement get current user
    return this.userService.getUser(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'User returned successfully', type: UserDto })
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }

  @Get(':userId/classrooms')
  @ApiOperation({ summary: 'List classrooms that a user has joined' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiOkResponse({ description: 'List of classrooms for the user returned successfully', type: [UserChannelDto] })
  async getUserChannels(@Param('userId') userId: string) {
    // Verify user exists
    await this.userService.getUser(userId);

    // Get all channels and filter by membership
    const allChannels = await this.classroomService.getAllClassrooms();
    return allChannels.filter(channel =>
      channel.members.some(member => member.userId === userId)
    );
  }
}
