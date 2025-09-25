import { Injectable, Logger } from '@nestjs/common';
import { ExpressPeerServer } from 'peer';
import { NestExpressApplication } from '@nestjs/platform-express';

@Injectable()
export class PeerService {
  private readonly logger = new Logger(PeerService.name);

  private peerServer: any;

  private connectedPeers: Map<string, {
    peerId: string;
    userId?: string;
    channels: string[];
    connection?: any; // Store the actual connection
  }> = new Map();

  constructor() {}

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
        channels: [],
        connection: client
      });
    });

    this.peerServer.on('data', (data) => {
      console.log('incoming:', data);
      const peerId = data.getId();
      console.log('incoming:', peerId,data);
    });

    this.peerServer.on('disconnect', (client) => {
      const peerId = client.getId();
      this.logger.log(`Client disconnected: ${peerId}`);
      this.connectedPeers.delete(peerId);
    });

    this.logger.log('PeerJS server initialized on NestJS application');
  }
}
