import { Module } from '@nestjs/common';
import { PeerModule } from './peer/peer.module';
import {CoreStaticFileLandingPageModule, CoreStaticFileModule} from "../core/static-file";

@Module({
  imports: [PeerModule,CoreStaticFileModule],
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
