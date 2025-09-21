import { Module } from '@nestjs/common';
import { PeerService } from './peer.service';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';
import { ChannelController } from './channel.controller';
import { UserController } from './user.controller';

@Module({
  providers: [PeerService, ChannelService, UserService],
  controllers: [ChannelController, UserController],
  exports: [PeerService, ChannelService, UserService],
})
export class PeerModule {}
