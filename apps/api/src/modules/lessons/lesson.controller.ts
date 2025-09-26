import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { LessonDto, CreateLessonDto, StartQuitLessonDto, SuccessDto, ToggleLessonDto, UpdateLessonDto } from './lesson.dto';

@ApiTags('Lessons')
@Controller('classrooms/:classroomId/lessons')
export class LessonController {
  constructor(private readonly service: LessonService) {}

  @Get()
  @ApiOperation({ summary: 'List channel types for a channel' })
  @ApiQuery({ name: 'requesterId', required: false, description: 'User id to evaluate visibility (owner sees all)' })
  @ApiOkResponse({ type: [LessonDto] })
  list(@Param('classroomId') classroomId: string, @Query('requesterId') requesterId?: string) {
    return this.service.list(classroomId, requesterId);
  }

  @Put()
  @ApiOperation({ summary: 'Create a new channel type (owner only)' })
  @ApiBody({ type: CreateLessonDto })
  @ApiOkResponse({ type: LessonDto })
  create(@Param('classroomId') classroomId: string, @Body() body: CreateLessonDto) {
    return this.service.create(classroomId, body.name, body.description, body.configuration, body.createdBy);
  }

  @Get(':lessonId')
  @ApiOperation({ summary: 'Get a lesson' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiQuery({ name: 'requesterId', required: false })
  @ApiOkResponse({ type: LessonDto })
  get(@Param('classroomId') classroomId: string, @Param('lessonId') lessonId: string, @Query('requesterId') requesterId?: string) {
    return this.service.get(classroomId, lessonId, requesterId);
  }

  @Patch(':lessonId')
  @ApiOperation({ summary: 'Update a lesson (owner only)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ type: UpdateLessonDto })
  @ApiOkResponse({ type: LessonDto })
  update(
    @Param('classroomId') classroomId: string,
    @Param('lessonId') lessonId: string,
    @Body() body: UpdateLessonDto ,
  ) {
    return this.service.update(classroomId, lessonId, body.userId, { name: body.name, description: body.description, configuration:body.configuration });
  }

  @Post(':lessonId/enable')
  @ApiOperation({ summary: 'Enable a lesson (owner only)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ type: ToggleLessonDto })
  @ApiOkResponse({ type: LessonDto })
  enable(@Param('classroomId') classroomId: string, @Param('lessonId') lessonId: string, @Body() body: ToggleLessonDto) {
    return this.service.setEnabled(classroomId, lessonId, body.requestedBy, true);
  }

  @Post(':lessonId/disable')
  @ApiOperation({ summary: 'Disable a lesson (owner only)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ type: ToggleLessonDto })
  @ApiOkResponse({ type: LessonDto })
  disable(@Param('classroomId') classroomId: string, @Param('lessonId') lessonId: string, @Body() body: ToggleLessonDto) {
    return this.service.setEnabled(classroomId, lessonId, body.requestedBy, false);
  }

  @Delete(':lessonId')
  @ApiOperation({ summary: 'Delete a lesson (owner only)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ schema: { properties: { requestedBy: { type: 'string' } } } })
  @ApiOkResponse({ type: SuccessDto })
  delete(
    @Param('classroomId') classroomId: string,
    @Param('lessonId') lessonId: string,
    @Body('requestedBy') requestedBy: string,
  ) {
    return this.service.delete(classroomId, lessonId, requestedBy);
  }

  @Post(':lessonId/start')
  @ApiOperation({ summary: 'Start a lesson (member + visible)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ type: StartQuitLessonDto })
  @ApiOkResponse({ type: SuccessDto })
  startLesson(@Param('classroomId') classroomId: string, @Param('lessonId') lessonId: string, @Body() body: StartQuitLessonDto) {
    return this.service.startLesson(classroomId, lessonId, body.userId);
  }

  @Post(':lessonId/quit')
  @ApiOperation({ summary: 'Quit a lesson (member)' })
  @ApiParam({ name: 'lessonId', type: 'string' })
  @ApiBody({ type: StartQuitLessonDto })
  @ApiOkResponse({ type: SuccessDto })
  quitLesson(@Param('classroomId') classroomId: string, @Param('lessonId') lessonId: string, @Body() body: StartQuitLessonDto) {
    return this.service.quitLesson(classroomId, lessonId, body.userId);
  }
}
