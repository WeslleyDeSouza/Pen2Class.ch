import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

declare var Peer: any;

@Component({
  selector: 'app-peer-test',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-8">PeerJS Connection Test</h1>

          <!-- Server Status -->
          <div class="mb-8 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Server Status</h3>
            <div
              class="p-3 rounded mb-3"
              [class]="isConnected ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'">
              {{ isConnected ? 'Connected to PeerJS Server' : 'Disconnected from PeerJS Server' }}
            </div>
            <button
              (click)="connectToPeerServer()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
              Connect to PeerJS Server
            </button>
          </div>

          <!-- Peer Connection -->
          <div class="mb-8 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Peer Connection</h3>
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Your Peer ID:</label>
              <span class="text-blue-600 font-mono">{{ myPeerId || 'Not connected' }}</span>
            </div>
            <div class="flex gap-2 mb-3">
              <input
                [(ngModel)]="remotePeerId"
                placeholder="Enter remote peer ID"
                class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button
                (click)="connectToPeer()"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                Connect
              </button>
            </div>
            <div
              class="p-3 rounded"
              [class]="connections.length > 0 ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'">
              {{ connections.length > 0 ? 'Connected to ' + connections.length + ' peer(s)' : 'No peer connections' }}
            </div>
          </div>

          <!-- Send Message -->
          <div class="mb-8 p-4 border rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Send Message</h3>
            <div class="flex gap-2">
              <input
                [(ngModel)]="messageInput"
                placeholder="Type a message"
                class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button
                (click)="sendMessage()"
                class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors">
                Send Message
              </button>
            </div>
          </div>

          <!-- Activity Log -->
          <div class="p-4 border rounded-lg">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold">Activity Log</h3>
              <button
                (click)="clearLog()"
                class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                Clear Log
              </button>
            </div>
            <div
              class="bg-gray-50 p-4 rounded h-64 overflow-y-auto font-mono text-sm"
              #logContainer>
              @for (logEntry of logEntries; track logEntry.timestamp) {
                <div class="mb-1">
                  [{{ logEntry.timestamp }}] {{ logEntry.message }}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PeerTestComponent implements OnInit, OnDestroy {
  peer: any = null;
  connections: any[] = [];
  isConnected = false;
  myPeerId = '';
  remotePeerId = '';
  messageInput = '';
  logEntries: { timestamp: string; message: string }[] = [];

  ngOnInit() {
    this.loadPeerJS();
  }

  ngOnDestroy() {
    if (this.peer) {
      this.peer.destroy();
    }
  }

  private loadPeerJS() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/peerjs@1.5.0/dist/peerjs.min.js';
    script.onload = () => {
      this.log('PeerJS library loaded');
      this.log('Click "Connect to PeerJS Server" to start');
    };
    document.head.appendChild(script);
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.push({ timestamp, message });

    // Keep only last 100 entries
    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(-100);
    }
  }

  connectToPeerServer() {
    try {
      this.peer = new Peer({
        host: environment.apiHost, port: environment.apiPort,
        path: '/peer-server'
      });

      this.peer.on('open', (id: string) => {
        this.log(`Connected to PeerJS server with ID: ${id}`);
        this.myPeerId = id;
        this.isConnected = true;
      });

      this.peer.on('connection', (conn: any) => {
        this.log(`Incoming connection from: ${conn.peer}`);
        this.setupConnection(conn);
      });

      this.peer.on('error', (error: any) => {
        this.log(`PeerJS Error: ${error.message}`);
        this.isConnected = false;
      });

      this.peer.on('disconnected', () => {
        this.log('Disconnected from PeerJS server');
        this.isConnected = false;
      });

    } catch (error: any) {
      this.log(`Failed to connect: ${error.message}`);
      this.isConnected = false;
    }
  }

  connectToPeer() {
    if (!this.remotePeerId.trim()) {
      this.log('Please enter a remote peer ID');
      return;
    }

    if (!this.peer) {
      this.log('Please connect to PeerJS server first');
      return;
    }

    try {
      const conn = this.peer.connect(this.remotePeerId.trim());
      this.setupConnection(conn);
      this.log(`Connecting to peer: ${this.remotePeerId}`);
    } catch (error: any) {
      this.log(`Failed to connect to peer: ${error.message}`);
    }
  }

  private setupConnection(conn: any) {
    this.connections.push(conn);

    conn.on('open', () => {
      this.log(`Connection established with: ${conn.peer}`);
    });

    conn.on('data', (data: any) => {
      this.log(`Received from ${conn.peer}: ${data}`);
    });

    conn.on('close', () => {
      this.log(`Connection closed with: ${conn.peer}`);
      this.connections = this.connections.filter(c => c !== conn);
    });

    conn.on('error', (error: any) => {
      this.log(`Connection error with ${conn.peer}: ${error.message}`);
    });
  }

  sendMessage() {
    if (!this.messageInput.trim()) {
      this.log('Please enter a message');
      return;
    }

    if (this.connections.length === 0) {
      this.log('No peer connections available');
      return;
    }

    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(this.messageInput);
        this.log(`Sent to ${conn.peer}: ${this.messageInput}`);
      }
    });

    this.messageInput = '';
  }

  clearLog() {
    this.logEntries = [];
  }
}
