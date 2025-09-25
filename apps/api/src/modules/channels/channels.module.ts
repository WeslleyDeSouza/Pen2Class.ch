import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { ChannelEntity } from './channel.entity';
import { ChannelMemberEntity } from './channel-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity, ChannelMemberEntity])],
  providers: [ChannelService],
  controllers: [ChannelController],
  exports: [ChannelService],
})
export class ChannelsModule {}
