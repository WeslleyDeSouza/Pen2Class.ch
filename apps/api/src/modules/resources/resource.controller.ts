import { Body, Controller, Delete, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { CreateResourceDto, ResourceDto, UpdateResourceDto } from './resource.dto';

@ApiTags('Resources')
@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Put()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiBody({ type: CreateResourceDto })
  @ApiOkResponse({ type: ResourceDto })
  async create(@Body() body: CreateResourceDto) {
    return this.resourceService.create(body);
    }

  @Put('upsert')
  @ApiOperation({ summary: 'Upsert an resource by Ids '})
  @ApiBody({ type: CreateResourceDto })
  @ApiOkResponse({ type: ResourceDto })
  async upsert(@Body() body: CreateResourceDto) {
    return this.resourceService.upsert(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing resource' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateResourceDto })
  @ApiOkResponse({ type: ResourceDto })
  async update(@Param('id') id: string, @Body() body: UpdateResourceDto) {
    return this.resourceService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an resource' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ schema: { example: { id: 'uuid', success: true } } })
  delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }

  @Get(':userId/:type/:classroomId/:lessonId')
  @ApiOperation({ summary: 'Get an resource by composite key (userId, type, classroomId, lessonId)' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiParam({ name: 'type', type: 'string' })
  @ApiParam({ name: 'classroomId', type: 'string' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiOkResponse({ type: ResourceDto })
  getByKey(
    @Param('userId') userId: string,
    @Param('type') type: string,
    @Param('classroomId') classroomId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.resourceService.getByKey({
      userId: userId,
      type: type,
      classroomId: classroomId,
      lessonId: lessonId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an resource by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: ResourceDto })
  getById(@Param('id') id: string) {
    return this.resourceService.getById(id);
  }

  @Get('by-classroom/:classroomId')
  @ApiOperation({ summary: 'List resources by classroom' })
  @ApiParam({ name: 'classroomId', type: 'string' })
  @ApiOkResponse({ type: [ResourceDto] })
  getByClassroom(@Param('classroomId') classroomId: string) {
    return this.resourceService.getByClassroom(classroomId);
  }
}
