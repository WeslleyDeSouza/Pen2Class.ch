import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelTypeEntity } from './channel-type.entity';
import { ChannelTypeLessonEntity } from './channel-type-lesson.entity';
import { ChannelTypeService } from './channel-type.service';
import { ChannelTypeController } from './channel-type.controller';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [ChannelsModule, TypeOrmModule.forFeature([ChannelTypeEntity, ChannelTypeLessonEntity])],
  providers: [ChannelTypeService],
  controllers: [ChannelTypeController],
  exports: [ChannelTypeService],
})
export class ChannelTypesModule {}
