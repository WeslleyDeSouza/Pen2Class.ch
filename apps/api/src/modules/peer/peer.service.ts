import { Injectable, Logger } from '@nestjs/common';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
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


  @OnEvent('peer.channel.message')
  onMessage(_payload: any) {
    const { type,  peerId, channelId, payload} = _payload;
    const {
      event,
      userId,
      displayName,
    } = payload ||{};

    // Emit to specific peer
    if((event+'').includes('object'))
    {
      this.emitToPeer(peerId, {
        type: event,
        channelId,
        payload,
        userId
      });
    }else {
      // Or emit to all peers in a channel
      this.emitToChannel(channelId, {
        type: event,
        channelId,
        payload,
        userId,
        fromPeerId: peerId
      });
    }
  }

  private emitToPeer(peerId: string, data: any) {
    const peer = this.connectedPeers.get(peerId);
    if (peer?.connection) {
      // If the connection has a send method
      peer.connection.send?.(data);
    }
  }

  private emitToChannel(channelId: string, data: any) {
    this.connectedPeers.forEach((peer) => {
      if (peer.channels.includes(channelId)) {
        peer.connection?.send?.(data);
      }
    });
  }
}
