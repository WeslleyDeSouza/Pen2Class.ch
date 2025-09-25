import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { ResourceEntity } from './resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceEntity])],
  providers: [ResourceService],
  controllers: [ResourceController, ],
  exports: [ResourceService],
})
export class ResourcesModule {}
