import {computed, inject, Injectable, signal} from '@angular/core';
import { environment } from '../../environments/environment';

declare var Peer: any;

@Injectable({ providedIn: 'root' })
export class PeerUserStoreService {
  user = signal<{id?:string} | undefined>(undefined);
  userPeerId = signal<string | undefined>(undefined);
  selectedClassId = signal<string | null>(null);
  selectedLessonId = signal<string | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  getCurrentUser(){
    return this.user();
  }

  persist(){
    const userData = this.user();
    if (userData) {
      localStorage.setItem('pen2class_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('pen2class_user');
    }
  }

  private loadFromStorage() {
    const storedUser = localStorage.getItem('pen2class_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.user.set(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('pen2class_user');
      }
    }
  }
}

@Injectable({ providedIn: 'root' })
export class PeerService {
  peerId = computed(()=> this.storeUser.userPeerId());
  isConnected = signal(false);


  private peer: any = null;
  private connections: Map<string, any> = new Map();

  private readonly rootHost = environment.apiHost;
  private readonly rootPort = environment.apiPort;
  private readonly rootPeerPath = environment.apiPeerPath;

  protected storeUser = inject(PeerUserStoreService);

  connectToPeerServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          host: this.rootHost,
          port: this.rootPort,
          path: this.rootPeerPath
        });

        this.peer.on('open', (id: string) => {
          this.storeUser.userPeerId.set(id);
          this.isConnected.set(true);

          // Send user metadata if logged in
          const currentUser = this.storeUser.user() as any;
          if (currentUser) {
            this.peer.metadata = { userId: currentUser?.id };
          }

          resolve(id);
        });

        this.peer.on('connection', (conn: any) => {
          console.log(`Incoming connection from: ${conn.peer}`);
          this.setupConnection(conn);
        });

        this.peer.on('error', (error: any) => {
          console.error(`PeerJS Error: ${error.message}`);
          this.isConnected.set(false);
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.log('Disconnected from PeerJS server');
          this.isConnected.set(false);
          this.storeUser.userPeerId.set(undefined);
        });

      } catch (error) {
        console.error(`Failed to connect: ${error}`);
        this.isConnected.set(false);
        reject(error);
      }
    });
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

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.isConnected.set(false);
    this.storeUser.userPeerId.set(undefined);
  }
}
