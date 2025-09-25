import {computed, inject, Injectable, signal} from '@angular/core';
import { environment } from '../../environments/environment';
import { Peer } from 'peerjs';
import { PeerBusService } from './peer-bus.service';
import {UserStoreService} from "../store";


@Injectable({ providedIn: 'root' })
export class PeerService {
  //peerId = computed(()=> this.storeUser.userPeerId());
  isConnected = signal(false);

  private peer: any = null;

  private readonly rootHost = environment.apiHost;
  private readonly rootPort = environment.apiPort;
  private readonly rootPeerPath = environment.apiPeerPath;

  protected storeUser = inject(UserStoreService);
  protected eventBus = inject(PeerBusService);

  connectToPeerServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          host: this.rootHost,
          port: this.rootPort,
          path: this.rootPeerPath
        });

        this.peer.on('open', (id: string) => {

          console.log(`Connected to Peer server with ID: ${id}`);

          //this.storeUser.userPeerId.set(id);
          this.isConnected.set(true);

          // Send user metadata if logged in
          const currentUser = this.storeUser.user() as any;
          if (currentUser) this.peer.metadata = { userId: currentUser?.id };

          resolve(id);
        });

        this.peer.on('error', (error: any) => {
          console.log(error)
          console.error(`PeerJS Error: ${error?.message}`);
          this.isConnected.set(false);
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.log('Disconnected from PeerJS server');
          this.isConnected.set(false);
          //this.storeUser.userPeerId.set(undefined);
        });

        this.peer.on('data', (data: any) => {
          console.log(`Received from Peer:`, data);
          // Handle different message types
          //this.handleIncomingMessage(data, conn);
        });

      } catch (error) {
        console.error(`Failed to connect: ${error}`);
        this.isConnected.set(false);
        reject(error);
      }
    });
  }

  checkPeerServerConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const testPeer = new Peer({
          host: this.rootHost,
          port: this.rootPort,
          path: this.rootPeerPath,
        });

        let settled = false;

        const cleanup = () => {
          try {
            // @ts-ignore
            if (testPeer && typeof testPeer.destroy === 'function') {
              testPeer.destroy();
            }
          } catch {}
        };

        testPeer.on('open', () => {
          this.isConnected.set(true);
          if (!settled) {
            settled = true;
            cleanup();
            resolve(true);
          }
        });

        testPeer.on('error', () => {
          this.isConnected.set(false);
          if (!settled) {
            settled = true;
            cleanup();
            resolve(false);
          }
        });

        setTimeout(() => {
          if (!settled) {
            this.isConnected.set(false);
            settled = true;
            cleanup();
            resolve(false);
          }
        }, 5000);
      } catch (e) {
        this.isConnected.set(false);
        resolve(false);
      }
    });
  }

  async emitUserInfo(){
    if(this.storeUser.getCurrentUser()) {

    }
  }


  private handleIncomingMessage(data: any, conn: any) {
    console.log('Received message:', data);
    if (data.type === 'channel_message') {
      // Emit event for UI to handle via global EventBusService
      this.eventBus.emit('channelMessage', data);
    }
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isConnected.set(false);
    //this.storeUser.userPeerId.set(undefined);
  }
}
