import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerService } from './peer.service';
import { ChannelService } from './channels/channel.service';
import { UserService } from './users/user.service';
import { ChannelController } from './channels/channel.controller';
import { UserController } from './users/user.controller';
import { ChannelTypeService } from './channel-types/channel-type.service';
import { ChannelTypeController } from './channel-types/channel-type.controller';
import { ObjectService } from './objects/object.service';
import { ObjectController } from './objects/object.controller';
import { UserEntity } from './users/user.entity';
import { ChannelEntity } from './channels/channel.entity';
import { ChannelMemberEntity } from './channels/channel-member.entity';
import { PeerObjectEntity } from './objects/peerObject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ChannelEntity, ChannelMemberEntity, PeerObjectEntity]),
  ],
  providers: [PeerService, ChannelService, UserService, ChannelTypeService, ObjectService],
  controllers: [ChannelController, UserController, ChannelTypeController, ObjectController],
  exports: [PeerService, ChannelService, UserService, ChannelTypeService, ObjectService],
})
export class PeerModule {}
