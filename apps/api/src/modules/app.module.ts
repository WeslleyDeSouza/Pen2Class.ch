import { Module } from '@nestjs/common';
import { PeerModule } from './peer/peer.module';
import { CoreStaticFileLandingPageModule, CoreStaticFileModule } from '../core/static-file';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env['DB_TYPE'] as any ,
      database: process.env['DB_DATABASE'],
      autoLoadEntities: true,
      synchronize: true, // process.env['APP_ENV'] !== 'production'
    }),
    PeerModule,
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
