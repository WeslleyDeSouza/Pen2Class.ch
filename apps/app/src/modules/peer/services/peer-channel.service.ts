import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, Channel, User } from './api.service';

declare var Peer: any;

@Injectable({
  providedIn:'root'
})
export class PeerChannelService {
  private peer: any = null;
  private connections: Map<string, any> = new Map();

  private currentUser$ = new BehaviorSubject<User | null>(null);
  private joinedChannels$ = new BehaviorSubject<Channel[]>([]);
  private availableChannels$ = new BehaviorSubject<Channel[]>([]);
  private isConnected$ = new BehaviorSubject<boolean>(false);
  private myPeerId$ = new BehaviorSubject<string>('');

  constructor(private apiService: ApiService) {
    this.loadAvailableChannels();
  }

  // Observables
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getJoinedChannels(): Observable<Channel[]> {
    return this.joinedChannels$.asObservable();
  }

  getAvailableChannels(): Observable<Channel[]> {
    return this.availableChannels$.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }

  getMyPeerId(): Observable<string> {
    return this.myPeerId$.asObservable();
  }

  // User management
  signup(username: string, email?: string, displayName?: string): Observable<User> {
    return this.apiService.signup(username, email, displayName);
  }

  setCurrentUser(user: User) {
    this.currentUser$.next(user);
    this.loadUserChannels();
  }

  // Peer connection
  connectToPeerServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          host: 'localhost',
          port: 3000,
          path: '/peer-server'
        });

        this.peer.on('open', (id: string) => {
          console.log(`Connected to PeerJS server with ID: ${id}`);
          this.myPeerId$.next(id);
          this.isConnected$.next(true);

          // Send user metadata if logged in
          const currentUser = this.currentUser$.value;
          if (currentUser) {
            this.peer.metadata = { userId: currentUser.id };
          }

          resolve(id);
        });

        this.peer.on('connection', (conn: any) => {
          console.log(`Incoming connection from: ${conn.peer}`);
          this.setupConnection(conn);
        });

        this.peer.on('error', (error: any) => {
          console.error(`PeerJS Error: ${error.message}`);
          this.isConnected$.next(false);
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.log('Disconnected from PeerJS server');
          this.isConnected$.next(false);
          this.myPeerId$.next('');
        });

      } catch (error) {
        console.error(`Failed to connect: ${error}`);
        this.isConnected$.next(false);
        reject(error);
      }
    });
  }

  // Channel management
  createChannel(name: string, description?: string): Observable<Channel> {
    const currentUser = this.currentUser$.value;
    const createdBy = currentUser ? currentUser.id : 'anonymous';
    const result = this.apiService.createChannel(name, description, createdBy);
    return result;
  }

  joinChannel(channel: Channel): Observable<{ success: boolean; channel: Channel }> {
    const currentUser = this.currentUser$.value;
    const peerId = this.myPeerId$.value;

    if (!currentUser || !peerId) {
      throw new Error('Must be logged in and connected to join a channel');
    }

    const result = this.apiService.joinChannel(channel.id, currentUser.id, peerId);
    result.subscribe(() => {
      this.loadUserChannels();
      this.connectToChannelMembers(channel.id);
    });
    return result;
  }

  leaveChannel(channel: Channel): Observable<{ success: boolean; channel: Channel }> {
    const currentUser = this.currentUser$.value;

    if (!currentUser) {
      throw new Error('Must be logged in to leave a channel');
    }

    const result = this.apiService.leaveChannel(channel.id, currentUser.id);
    result.subscribe(() => {
      this.loadUserChannels();
      this.disconnectFromChannel(channel.id);
    });
    return result;
  }

  // Messaging
  sendMessageToChannel(channelId: string, message: any) {
    const channelConnections = Array.from(this.connections.values())
      .filter(conn => conn.metadata?.channelId === channelId);

    channelConnections.forEach(conn => {
      if (conn.open) {
        conn.send({
          type: 'channel_message',
          channelId,
          message,
          from: this.currentUser$.value?.username || 'anonymous',
          timestamp: new Date()
        });
      }
    });
  }

  // Public method to reload available channels
  loadAvailableChannels() {
    this.apiService.getChannels().subscribe(channels => {
      this.availableChannels$.next(channels);
    });
  }

  private loadUserChannels() {
    const currentUser = this.currentUser$.value;
    if (currentUser) {
      this.apiService.getUserChannels(currentUser.id).subscribe(channels => {
        this.joinedChannels$.next(channels);
      });
    }
  }

  private connectToChannelMembers(channelId: string) {
    this.apiService.getChannelMembers(channelId).subscribe(members => {
      const myPeerId = this.myPeerId$.value;

      members.forEach(member => {
        if (member.peerId !== myPeerId && !this.connections.has(member.peerId)) {
          this.connectToPeer(member.peerId, channelId);
        }
      });
    });
  }

  private connectToPeer(peerId: string, channelId: string) {
    if (!this.peer) return;

    try {
      const conn = this.peer.connect(peerId, {
        metadata: { channelId }
      });
      this.setupConnection(conn);
    } catch (error) {
      console.error(`Failed to connect to peer ${peerId}:`, error);
    }
  }

  private setupConnection(conn: any) {
    this.connections.set(conn.peer, conn);

    conn.on('open', () => {
      console.log(`Connection established with: ${conn.peer}`);
    });

    conn.on('data', (data: any) => {
      console.log(`Received from ${conn.peer}:`, data);
      // Handle different message types
      this.handleIncomingMessage(data, conn);
    });

    conn.on('close', () => {
      console.log(`Connection closed with: ${conn.peer}`);
      this.connections.delete(conn.peer);
    });

    conn.on('error', (error: any) => {
      console.error(`Connection error with ${conn.peer}:`, error);
    });
  }

  private handleIncomingMessage(data: any, conn: any) {
    if (data.type === 'channel_message') {
      // Emit event for UI to handle
      const event = new CustomEvent('channelMessage', { detail: data });
      window.dispatchEvent(event);
    }
  }

  private disconnectFromChannel(channelId: string) {
    const channelConnections = Array.from(this.connections.entries())
      .filter(([, conn]) => conn.metadata?.channelId === channelId);

    channelConnections.forEach(([peerId, conn]) => {
      conn.close();
      this.connections.delete(peerId);
    });
  }

  // Cleanup
  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.isConnected$.next(false);
    this.myPeerId$.next('');
  }
}
