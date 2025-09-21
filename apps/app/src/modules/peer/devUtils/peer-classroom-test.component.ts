import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PeerChannelService } from '../services/peer-channel.service';
import { Channel, User } from '../services/api.service';
import { Observable, Subscription } from 'rxjs';

declare var Peer: any;

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-blue-600 text-white p-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <h1 class="text-2xl font-bold">Pen2Class - Peer-to-Peer Classrooms</h1>
          <div class="flex items-center gap-4">
            <span *ngIf="currentUser$ | async as user" class="text-blue-100">
              Welcome, {{user.displayName}}!
            </span>
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                [class]="(isConnected$ | async) ? 'bg-green-400' : 'bg-red-400'">
              </div>
              <span class="text-sm">
                {{ (isConnected$ | async) ? 'Connected' : 'Disconnected' }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-6xl mx-auto p-6">
        <!-- Login/Signup Section -->
        <div *ngIf="!(currentUser$ | async)" class="mb-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-bold mb-4">Sign Up to Join Classrooms</h2>
            <div class="flex gap-4">
              <input
                [(ngModel)]="signupForm.username"
                placeholder="Username"
                class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <input
                [(ngModel)]="signupForm.displayName"
                placeholder="Display Name"
                class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <input
                [(ngModel)]="signupForm.email"
                placeholder="Email (optional)"
                type="email"
                class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button
                (click)="signup()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content (only show if logged in) -->
        <div *ngIf="currentUser$ | async">
          <!-- Connection Status -->
          <div class="mb-6">
            <div class="bg-white rounded-lg shadow p-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-semibold">Peer Connection</h3>
                  <span class="text-sm text-gray-600" *ngIf="myPeerId$ | async as peerId">
                    Your Peer ID: <code class="bg-gray-100 px-2 py-1 rounded">{{peerId}}</code>
                  </span>
                </div>
                <button
                  *ngIf="(isConnected$ | async) === false"
                  (click)="connectToPeer()"
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">
                  Connect to Peer Network
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Available Channels -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Available Classrooms</h2>
                <button
                  (click)="showCreateChannel = true"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
                  Create Classroom
                </button>
              </div>

              <!-- Create Channel Form -->
              <div *ngIf="showCreateChannel" class="mb-4 p-4 border rounded-lg bg-gray-50">
                <div class="flex gap-2 mb-2">
                  <input
                    [(ngModel)]="newChannelName"
                    placeholder="Classroom name"
                    class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <button
                    (click)="createChannel()"
                    [disabled]="isCreatingChannel"
                    class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors">
                    {{isCreatingChannel ? 'Creating...' : 'Create'}}
                  </button>
                  <button
                    (click)="showCreateChannel = false"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                    Cancel
                  </button>
                </div>
                <input
                  [(ngModel)]="newChannelDescription"
                  placeholder="Description (optional)"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <!-- Channel List -->
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div *ngFor="let channel of availableChannels$ | async"
                     class="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold">{{channel.name}}</h3>
                      <p *ngIf="channel.description" class="text-sm text-gray-600 mb-2">{{channel.description}}</p>
                      <div class="text-xs text-gray-500">
                        <span>{{channel.members.length}} member(s)</span>
                        <span class="ml-2">Created: {{channel.createdAt | date:'short'}}</span>
                      </div>
                    </div>
                    <button
                      (click)="joinChannel(channel)"
                      [disabled]="(isConnected$ | async) === false"
                      class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm transition-colors">
                       {{(isConnected$ | async) === false ? 'Not Connected' : 'Join'}}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Joined Channels -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h2 class="text-xl font-bold mb-4">My Classrooms</h2>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div *ngFor="let channel of joinedChannels$ | async"
                     class="p-4 border rounded-lg bg-blue-50">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="font-semibold text-blue-800">{{channel.name}}</h3>
                      <p *ngIf="channel.description" class="text-sm text-blue-600 mb-2">{{channel.description}}</p>
                      <div class="text-xs text-blue-500 mb-3">
                        <span>{{channel.members.length}} member(s)</span>
                      </div>

                      <!-- Simple messaging -->
                      <div class="mt-3">
                        <div class="flex gap-2">
                          <input
                            [(ngModel)]="channelMessages[channel.id]"
                            placeholder="Send message to classroom..."
                            class="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            (keyup.enter)="sendMessage(channel.id)">
                          <button
                            (click)="sendMessage(channel.id)"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      (click)="leaveChannel(channel)"
                      class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors ml-2">
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Log -->
          <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Activity Log</h2>
              <button
                (click)="clearLog()"
                class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                Clear
              </button>
            </div>
            <div class="bg-gray-50 p-4 rounded h-48 overflow-y-auto font-mono text-sm">
              <div *ngFor="let entry of logEntries" class="mb-1">
                [{{entry.timestamp}}] {{entry.message}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PeerClassroomTestComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  joinedChannels$: Observable<Channel[]>;
  availableChannels$: Observable<Channel[]>;
  isConnected$: Observable<boolean>;
  myPeerId$: Observable<string>;

  signupForm = {
    username: '',
    displayName: '',
    email: ''
  };

  showCreateChannel = false;
  newChannelName = '';
  newChannelDescription = '';
  isCreatingChannel = false;
  channelMessages: { [channelId: string]: string } = {};
  logEntries: { timestamp: string; message: string }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private peerChannelService: PeerChannelService) {
    this.currentUser$ = this.peerChannelService.getCurrentUser();
    this.joinedChannels$ = this.peerChannelService.getJoinedChannels();
    this.availableChannels$ = this.peerChannelService.getAvailableChannels();
    this.isConnected$ = this.peerChannelService.getConnectionStatus();
    this.myPeerId$ = this.peerChannelService.getMyPeerId();
  }

  ngOnInit() {
    this.loadPeerJS();
    this.setupMessageListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.peerChannelService.disconnect();
  }

  private loadPeerJS() {
    if (typeof Peer === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.0/dist/peerjs.min.js';
      script.onload = () => {
        this.log('PeerJS library loaded');
      };
      document.head.appendChild(script);
    }
  }

  private setupMessageListener() {
    window.addEventListener('channelMessage', (event: any) => {
      const data = event.detail;
      this.log(`Message in ${data.channelId} from ${data.from}: ${data.message}`);
    });
  }

  signup() {
    if (!this.signupForm.username.trim()) {
      this.log('Please enter a username');
      return;
    }

    this.peerChannelService.signup(
      this.signupForm.username,
      this.signupForm.email || undefined,
      this.signupForm.displayName || undefined
    ).subscribe({
      next: (user) => {
        this.log(`Signed up successfully as ${user.username}`);
        this.peerChannelService.setCurrentUser(user);
        this.signupForm = { username: '', displayName: '', email: '' };
      },
      error: (error) => {
        this.log(`Signup failed: ${error.error?.message || error.message}`);
      }
    });
  }

  connectToPeer() {
    this.peerChannelService.connectToPeerServer().then(peerId => {
      this.log(`Connected to peer network with ID: ${peerId}`);
      // Reload available channels after successful connection
      this.peerChannelService.loadAvailableChannels();
    }).catch(error => {
      this.log(`Failed to connect to peer network: ${error.message}`);
    });
  }


  createChannel() {
    if (!this.newChannelName.trim()) {
      this.log('Please enter a channel name');
      return;
    }

    if (this.isCreatingChannel) {
      this.log('Channel creation already in progress...');
      return;
    }

    this.isCreatingChannel = true;

    this.peerChannelService.createChannel(this.newChannelName, this.newChannelDescription || undefined).subscribe({
      next: (channel) => {
        this.log(`Created classroom: ${channel.name}`);
        this.newChannelName = '';
        this.newChannelDescription = '';
        this.showCreateChannel = false;
        this.isCreatingChannel = false;
        this.peerChannelService.loadAvailableChannels();
      },
      error: (error) => {
        this.log(`Failed to create classroom: ${error.error?.message || error.message}`);
        this.isCreatingChannel = false;
      }
    });
  }

  joinChannel(channel: Channel) {
    this.peerChannelService.joinChannel(channel).subscribe({
      next: () => {
        this.log(`Joined classroom: ${channel.name}`);
      },
      error: (error) => {
        this.log(`Failed to join classroom: ${error.error?.message || error.message}`);
      }
    });
  }

  leaveChannel(channel: Channel) {
    this.peerChannelService.leaveChannel(channel).subscribe({
      next: () => {
        this.log(`Left classroom: ${channel.name}`);
      },
      error: (error) => {
        this.log(`Failed to leave classroom: ${error.error?.message || error.message}`);
      }
    });
  }

  sendMessage(channelId: string) {
    const message = this.channelMessages[channelId];
    if (!message?.trim()) return;

    this.peerChannelService.sendMessageToChannel(channelId, message);
    this.log(`Sent message to classroom: ${message}`);
    this.channelMessages[channelId] = '';
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.push({ timestamp, message });

    if (this.logEntries.length > 100) {
      this.logEntries = this.logEntries.slice(-100);
    }
  }

  clearLog() {
    this.logEntries = [];
  }
}
