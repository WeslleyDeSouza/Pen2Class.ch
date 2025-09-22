import { Body, Controller, Delete, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ObjectService } from './object.service';
import { CreatePeerObjectDto, PeerObjectDto, UpdatePeerObjectDto } from './object.dto';

@ApiTags('Lesson Objects')
@Controller('objects')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Put()
  @ApiOperation({ summary: 'Create a new object via peer' })
  @ApiBody({ type: CreatePeerObjectDto })
  @ApiOkResponse({ type: PeerObjectDto })
  create(@Body() body: CreatePeerObjectDto) {
    return this.objectService.create(body);
    }

  @Put('upsert')
  @ApiOperation({ summary: 'Upsert an object by userId, type, channelId, channelTypeId' })
  @ApiBody({ type: CreatePeerObjectDto })
  @ApiOkResponse({ type: PeerObjectDto })
  upsert(@Body() body: CreatePeerObjectDto) {
    return this.objectService.upsert(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing object' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdatePeerObjectDto })
  @ApiOkResponse({ type: PeerObjectDto })
  update(@Param('id') id: string, @Body() body: UpdatePeerObjectDto) {
    return this.objectService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an object' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: { example: { id: 'uuid', success: true } } })
  delete(@Param('id') id: string) {
    return this.objectService.delete(id);
  }

  @Get(':userId/:type/:channelId/:channelTypeId')
  @ApiOperation({ summary: 'Get an object by composite key (userId, type, channelId, channelTypeId)' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiParam({ name: 'type', type: 'string' })
  @ApiParam({ name: 'channelId', type: 'string' })
  @ApiParam({ name: 'channelTypeId', type: 'string' })
  @ApiOkResponse({ type: PeerObjectDto })
  getByKey(
    @Param('userId') userId: string,
    @Param('type') type: string,
    @Param('channelId') channelId: string,
    @Param('channelTypeId') channelTypeId: string,
  ) {
    return this.objectService.getByKey({
      userId: userId,
      type: type,
      channelId: channelId,
      channelTypeId: channelTypeId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an object by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: PeerObjectDto })
  getById(@Param('id') id: string) {
    return this.objectService.getById(id);
  }

  @Get('by-channel/:channelId')
  @ApiOperation({ summary: 'List objects by channel' })
  @ApiParam({ name: 'channelId', type: 'string' })
  @ApiOkResponse({ type: [PeerObjectDto] })
  getByChannel(@Param('channelId') channelId: string) {
    return this.objectService.getByChannel(channelId);
  }
}
