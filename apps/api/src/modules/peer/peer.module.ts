import { Module } from '@nestjs/common';
import { PeerService } from './peer.service';
import { ChannelService } from './channels/channel.service';
import { UserService } from './users/user.service';
import { ChannelController } from './channels/channel.controller';
import { UserController } from './users/user.controller';

@Module({
  providers: [PeerService, ChannelService, UserService],
  controllers: [ChannelController, UserController],
  exports: [PeerService, ChannelService, UserService],
})
export class PeerModule {}
