import { Module } from '@nestjs/common';
import { PeerService } from './peer.service';
import { ChannelService } from './channels/channel.service';
import { UserService } from './users/user.service';
import { ChannelController } from './channels/channel.controller';
import { UserController } from './users/user.controller';
import { ChannelTypeService } from './channel-types/channel-type.service';
import { ChannelTypeController } from './channel-types/channel-type.controller';

@Module({
  providers: [PeerService, ChannelService, UserService, ChannelTypeService],
  controllers: [ChannelController, UserController, ChannelTypeController],
  exports: [PeerService, ChannelService, UserService, ChannelTypeService],
})
export class PeerModule {}
