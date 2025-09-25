import { Module } from '@nestjs/common';
import { CoreStaticFileLandingPageModule, CoreStaticFileModule } from '../core/static-file';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsModule } from './channels/channels.module';
import { UsersModule } from './users/users.module';
import { ChannelTypesModule } from './channel-types/channel-types.module';
import { ObjectsModule } from './objects/objects.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env['DB_TYPE'] as any ,
      database: process.env['DB_DATABASE'],
      autoLoadEntities: true,
      synchronize: true, // process.env['APP_ENV'] !== 'production'
    }),
    ChannelsModule,
    UsersModule,
    ChannelTypesModule,
    ObjectsModule,
    CoreStaticFileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

@Module({
  imports: [CoreStaticFileLandingPageModule],
  controllers: [],
  providers: [],
})
export class AppLandingPageModule {}
