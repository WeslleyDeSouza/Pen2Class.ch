import { Injectable, Logger } from '@nestjs/common';
import { ExpressPeerServer } from 'peer';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ChannelService } from './channel.service';

@Injectable()
export class PeerService {
  private readonly logger = new Logger(PeerService.name);
  private peerServer: any;
  private connectedPeers: Map<string, { peerId: string; userId?: string; channels: string[] }> = new Map();

  constructor(private channelService: ChannelService) {}

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

      // Remove from all channels that this peer was connected to
      const userChannels = this.channelService.getChannelsByPeerId(peerId);
      userChannels.forEach(channel => {
        // Find the member with this peerId and remove them
        channel.members = channel.members.filter(member => member.peerId !== peerId);
      });

      this.connectedPeers.delete(peerId);
    });

    this.logger.log('PeerJS server initialized on NestJS application');
  }

  // Get connected peers for a specific channel
  getChannelPeers(channelId: string): string[] {
    return this.channelService.getChannelPeerIds(channelId);
  }

  // Check if a peer is connected
  isPeerConnected(peerId: string): boolean {
    return this.connectedPeers.has(peerId);
  }

  // Get all connected peers
  getConnectedPeers(): Array<{ peerId: string; userId?: string; channels: string[] }> {
    return Array.from(this.connectedPeers.values());
  }
}
