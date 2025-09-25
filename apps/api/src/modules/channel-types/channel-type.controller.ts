import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChannelTypeService } from './channel-type.service';
import { ChannelTypeDto, CreateChannelTypeDto, StartQuitLessonDto, SuccessDto, ToggleChannelTypeDto, UpdateChannelTypeDto } from './channel-type.dto';

@ApiTags('Channel Types')
@Controller('channels/:channelId/types')
export class ChannelTypeController {
  constructor(private readonly service: ChannelTypeService) {}

  @Get()
  @ApiOperation({ summary: 'List channel types for a channel' })
  @ApiQuery({ name: 'requesterId', required: false, description: 'User id to evaluate visibility (owner sees all)' })
  @ApiOkResponse({ type: [ChannelTypeDto] })
  list(@Param('channelId') channelId: string, @Query('requesterId') requesterId?: string) {
    return this.service.list(channelId, requesterId);
  }

  @Put()
  @ApiOperation({ summary: 'Create a new channel type (owner only)' })
  @ApiBody({ type: CreateChannelTypeDto })
  @ApiOkResponse({ type: ChannelTypeDto })
  create(@Param('channelId') channelId: string, @Body() body: CreateChannelTypeDto) {
    return this.service.create(channelId, body.name, body.description, body.createdBy);
  }

  @Get(':typeId')
  @ApiOperation({ summary: 'Get a channel type' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiQuery({ name: 'requesterId', required: false })
  @ApiOkResponse({ type: ChannelTypeDto })
  get(@Param('channelId') channelId: string, @Param('typeId') typeId: string, @Query('requesterId') requesterId?: string) {
    return this.service.get(channelId, typeId, requesterId);
  }

  @Patch(':typeId')
  @ApiOperation({ summary: 'Update a channel type (owner only)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ type: UpdateChannelTypeDto })
  @ApiOkResponse({ type: ChannelTypeDto })
  update(
    @Param('channelId') channelId: string,
    @Param('typeId') typeId: string,
    @Body() body: UpdateChannelTypeDto & { requestedBy: string },
  ) {
    return this.service.update(channelId, typeId, (body as any).requestedBy, { name: body.name, description: body.description });
  }

  @Post(':typeId/enable')
  @ApiOperation({ summary: 'Enable a channel type (owner only)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ type: ToggleChannelTypeDto })
  @ApiOkResponse({ type: ChannelTypeDto })
  enable(@Param('channelId') channelId: string, @Param('typeId') typeId: string, @Body() body: ToggleChannelTypeDto) {
    return this.service.setEnabled(channelId, typeId, body.requestedBy, true);
  }

  @Post(':typeId/disable')
  @ApiOperation({ summary: 'Disable a channel type (owner only)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ type: ToggleChannelTypeDto })
  @ApiOkResponse({ type: ChannelTypeDto })
  disable(@Param('channelId') channelId: string, @Param('typeId') typeId: string, @Body() body: ToggleChannelTypeDto) {
    return this.service.setEnabled(channelId, typeId, body.requestedBy, false);
  }

  @Delete(':typeId')
  @ApiOperation({ summary: 'Delete a channel type (owner only)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ schema: { properties: { requestedBy: { type: 'string' } } } })
  @ApiOkResponse({ type: SuccessDto })
  delete(
    @Param('channelId') channelId: string,
    @Param('typeId') typeId: string,
    @Body('requestedBy') requestedBy: string,
  ) {
    return this.service.delete(channelId, typeId, requestedBy);
  }

  @Post(':typeId/start')
  @ApiOperation({ summary: 'Start a lesson for a channel type (member + visible)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ type: StartQuitLessonDto })
  @ApiOkResponse({ type: SuccessDto })
  startLesson(@Param('channelId') channelId: string, @Param('typeId') typeId: string, @Body() body: StartQuitLessonDto) {
    return this.service.startLesson(channelId, typeId, body.userId);
  }

  @Post(':typeId/quit')
  @ApiOperation({ summary: 'Quit a lesson for a channel type (member)' })
  @ApiParam({ name: 'typeId', type: 'string' })
  @ApiBody({ type: StartQuitLessonDto })
  @ApiOkResponse({ type: SuccessDto })
  quitLesson(@Param('channelId') channelId: string, @Param('typeId') typeId: string, @Body() body: StartQuitLessonDto) {
    return this.service.quitLesson(channelId, typeId, body.userId);
  }
}
