import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeerModule } from '../modules/peer/peer.module';


@Module({
  imports: [PeerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
