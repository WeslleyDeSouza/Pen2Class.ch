import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpressPeerServer } from 'peer';
import { NestExpressApplication } from '@nestjs/platform-express';

@Injectable()
export class PeerService {
  private readonly logger = new Logger(PeerService.name);
  private peerServer: any;
  private connectedPeers: Map<string, { peerId: string; userId?: string; channels: string[] }> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  enablePeerServer(app: NestExpressApplication) {
    this.peerServer = ExpressPeerServer(app.getHttpServer(), {
      path: '/peer-server',
      allow_discovery: true,
      proxied: true,
    });

    app.use(this.peerServer);

    this.peerServer.on('connection', (client) => {
      const peerId = client.getId();
      this.logger.log(`Client connected: ${peerId}`);

      this.connectedPeers.set(peerId, {
        peerId,
        channels: []
      });
    });

    this.peerServer.on('disconnect', (client) => {
      const peerId = client.getId();
      this.logger.log(`Client disconnected: ${peerId}`);

      const peerData = this.connectedPeers.get(peerId);
      this.eventEmitter.emit('peer.disconnected', {
        peerId,
        userId: peerData?.userId,
        channels: peerData?.channels || []
      });

      this.connectedPeers.delete(peerId);
    });

    this.logger.log('PeerJS server initialized on NestJS application');
  }
}
