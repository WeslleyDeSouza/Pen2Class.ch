import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectService } from './object.service';
import { ObjectController } from './object.controller';
import { PeerObjectEntity } from './peerObject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeerObjectEntity])],
  providers: [ObjectService],
  controllers: [ObjectController],
  exports: [ObjectService],
})
export class ObjectsModule {}
