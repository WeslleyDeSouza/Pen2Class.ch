import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Channel, User } from '../../../common';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ChannelService } from '../../../common/services/channel.service';
import { UserService, UserType } from '../../../common/services/user.service';
import { PeerService } from '../../../common/services/peer.service';

declare var Peer: any;
interface StoredConnectionInfo {
  user: User;
  channel: Channel;
  timestamp: number;
}
@Component({
  selector: 'app-peer-classroom-user',
  standalone: true,
  imports: [FormsModule, AsyncPipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 01-3-3m3 3a3 3 0 01-3 3m3-3h1m-4 3v2a7 7 0 01-14 0v-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8.1"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Join Classroom</h1>
          <p class="text-gray-600 mt-2">Connect with your peer-to-peer classroom</p>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-2">
            <div [class]="currentStep >= 1 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
            <div [class]="currentStep >= 2 ? 'w-8 h-1 bg-blue-500' : 'w-8 h-1 bg-gray-300'"></div>
            <div [class]="currentStep >= 2 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
            <div [class]="currentStep >= 3 ? 'w-8 h-1 bg-blue-500' : 'w-8 h-1 bg-gray-300'"></div>
            <div [class]="currentStep >= 3 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
          </div>
        </div>

        <!-- Connection Status -->
        @if (currentStep >= 3) {
          <div class="mb-6 p-3 rounded-lg border" [class]="(isConnected$ | async) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full" [class]="(isConnected$ | async) ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm font-medium" [class]="(isConnected$ | async) ? 'text-green-800' : 'text-red-800'">
                {{ (isConnected$ | async) ? 'Connected to peer network' : 'Disconnected' }}
              </span>
              @if (myPeerId$ | async; as peerId) {
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{peerId}}</code>
              }
            </div>
          </div>
        }

        <!-- Loading/Restoring State -->
        @if (isLoading && currentStep === 2 && !username) {
          <div class="space-y-4 animate-fade-in text-center">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg class="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <p class="text-gray-600">Restoring your previous session...</p>
            <p class="text-sm text-gray-500">This may take a moment</p>
          </div>
        }

        <!-- Step 1: Username -->
        @if (currentStep === 1) {
          <div class="space-y-4 animate-fade-in">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter your name</label>
              <input
                [(ngModel)]="username"
                placeholder="Your display name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                (keyup.enter)="nextStep()"
                #usernameInput>
            </div>
            <button
              (click)="nextStep()"
              [disabled]="!username.trim() || isLoading"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
              {{ isLoading ? 'Creating user...' : 'Continue' }}
            </button>
          </div>
        }

        <!-- Step 2: Classroom Code -->
        @if (currentStep === 2) {
          <div class="space-y-4 animate-fade-in">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter classroom code</label>
              <input
                [(ngModel)]="classroomCode"
                placeholder="Enter 6-digit code"
                maxlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                (keyup.enter)="joinClassroom()"
                (input)="onCodeInput($event)"
                #codeInput>
            </div>
            <button
              (click)="joinClassroom()"
              [disabled]="!isValidCode() || isLoading"
              class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
              {{ isLoading ? 'Joining...' : 'Join Classroom' }}
            </button>
            <button
              (click)="previousStep()"
              class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
              Back
            </button>
          </div>
        }

        <!-- Step 3: Connected -->
        @if (currentStep === 3 && currentChannel) {
          <div class="space-y-4 animate-fade-in">
            <div class="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-green-800 mb-1">Successfully joined!</h3>
              <p class="text-sm text-green-600">{{currentChannel.name}}</p>
              @if (currentChannel.description) {
                <p class="text-xs text-green-500 mt-1">{{currentChannel.description}}</p>
              }
            </div>

            <!-- Classroom Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Classroom Details</h4>
              <div class="space-y-1 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Members:</span>
                  <span>{{currentChannel.members.length}}</span>
                </div>
                <div class="flex justify-between">
                  <span>Code:</span>
                  <code class="bg-white px-2 py-1 rounded border">{{currentChannel.code}}</code>
                </div>
              </div>
            </div>

            <!-- Simple Chat -->
            <div class="bg-white border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Chat</h4>
              <div class="flex space-x-2">
                <input
                  [(ngModel)]="messageInput"
                  placeholder="Type a message..."
                  class="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  (keyup.enter)="sendMessage()">
                <button
                  (click)="sendMessage()"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Send
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              @if ((isConnected$ | async) === false) {
                <button
                  (click)="reconnect()"
                  [disabled]="isLoading"
                  class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 text-sm rounded-lg transition-colors">
                  {{ isLoading ? 'Reconnecting...' : 'Reconnect' }}
                </button>
              }
              <button
                (click)="leaveClassroom()"
                class="flex-1 text-red-600 hover:text-red-800 py-2 text-sm transition-colors border border-red-200 hover:border-red-300 rounded-lg">
                Leave Classroom
              </button>
            </div>
          </div>
        }

        <!-- Error Messages -->
        @if (errorMessage) {
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p class="text-sm text-red-800">{{errorMessage}}</p>
          </div>
        }

        <!-- Activity Log -->
        @if (currentStep === 3 && logEntries.length > 0) {
          <div class="mt-6 bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-sm font-medium text-gray-900">Activity</h4>
              <button
                (click)="clearLog()"
                class="text-xs text-gray-600 hover:text-gray-800">
                Clear
              </button>
            </div>
            <div class="max-h-32 overflow-y-auto text-xs font-mono text-gray-600 space-y-1">
              @for (entry of logEntries.slice(-5); track entry.timestamp) {
                <div>[{{entry.timestamp}}] {{entry.message}}</div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <style>
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `
})


export class PeerClassroomUserTestComponent implements OnInit, OnDestroy {
  currentStep = 1;
  username = '';
  classroomCode = '';
  messageInput = '';
  errorMessage = '';
  isLoading = false;
  currentChannel: Channel | null = null;
  logEntries: { timestamp: string; message: string }[] = [];

  currentUser$: Observable<User | null>;
  isConnected$: Observable<boolean>;
  myPeerId$: Observable<string>;

  private subscriptions: Subscription[] = [];
  private readonly STORAGE_KEY = 'pen2class_connection';
  private readonly CONNECTION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private myPeerIdSubject = new BehaviorSubject<string>('');

  constructor(private channelService: ChannelService, private userService: UserService, private peerService: PeerService) {
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isConnected$ = this.isConnectedSubject.asObservable();
    this.myPeerId$ = this.myPeerIdSubject.asObservable();
  }

  ngOnInit() {
    this.loadPeerJS();
    this.setupMessageListener();
    this.checkStoredConnection();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.isConnectedSubject.next(false);
    this.myPeerIdSubject.next('');
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
      this.log(`Message from ${data.from}: ${data.message}`);
    });
  }

  nextStep() {
    if (this.currentStep === 1) {
      this.createUser();
    }
  }

  previousStep() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.errorMessage = '';
    }
  }

  private createUser() {
    if (!this.username.trim()) {
      this.showError('Please enter your name');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService.signup(this.username.trim(), undefined, this.username.trim(), UserType.STUDENT).then((user: any) => {
      this.log(`User created: ${user.username}`);
      this.currentUserSubject.next(user);
      this.currentStep = 2;
      this.isLoading = false;

      // Auto-focus the code input after animation
      setTimeout(() => {
        const codeInput = document.querySelector('input[placeholder*="Enter 6-digit"]') as HTMLInputElement;
        if (codeInput) codeInput.focus();
      }, 300);
    }).catch((error: any) => {
      this.showError(error.error?.message || 'Failed to create user');
      this.isLoading = false;
    });
  }

  onCodeInput(event: any) {
    // Only allow numbers and limit to 6 digits
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value.length > 6) {
      value = value.substring(0, 6);
    }
    this.classroomCode = value;
    event.target.value = value;
  }

  isValidCode(): boolean {
    return this.classroomCode.length === 6 && /^\d+$/.test(this.classroomCode);
  }

  joinClassroom() {
    if (!this.isValidCode()) {
      this.showError('Please enter a valid 6-digit classroom code');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // First connect to peer server
    this.peerService.connectToPeerServer().then((peerId: string) => {
      this.log('Connected to peer network');
      // Directly try to join by code using API
      this.findAndJoinChannelByCode(peerId);
    }).catch(() => {
      this.showError('Failed to connect to peer network');
      this.isLoading = false;
    });
  }

  private findAndJoinChannelByCode(peerId: string) {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      this.showError('Please create a user first');
      this.isLoading = false;
      return;
    }

    this.channelService.getChannelByCode(this.classroomCode).then((channel: any) => {
      this.channelService.joinChannel(channel.id, (currentUser as any).id, peerId).then(() => {
        this.log(`Joined classroom: ${channel.name}`);
        this.currentChannel = channel;
        this.currentStep = 3;
        this.isLoading = false;
        this.saveConnection(currentUser as any, channel as any);
      }).catch((error: any) => {
        const errorMessage = error?.error?.message || 'Failed to join classroom';
        this.showError(errorMessage);
        this.isLoading = false;
      });
    }).catch((error: any) => {
      let errorMessage = 'Failed to join classroom';
      if (error?.status === 404) {
        errorMessage = 'Classroom not found. Please check the code and try again.';
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }
      this.showError(errorMessage);
      this.isLoading = false;
    });
  }

  sendMessage() {
    if (!this.messageInput.trim() || !this.currentChannel) return;
    // Messaging via PeerJS is not implemented in this test component.
    this.log(`Sent: ${this.messageInput.trim()}`);
    this.messageInput = '';
  }

  leaveClassroom() {
    if (!this.currentChannel) return;
    const user = this.currentUserSubject.value;
    if (!user) { this.showError('Please create a user first'); return; }

    this.channelService.leaveChannel(this.currentChannel.id, (user as any).id).then(() => {
      this.log(`Left classroom: ${this.currentChannel!.name}`);
      this.clearStoredConnection(); // Clear saved data
      this.currentChannel = null;
      this.currentStep = 2;
      this.classroomCode = '';
      this.peerService.disconnect();
    }).catch(() => {
      this.showError('Failed to leave classroom');
    });
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logEntries.push({ timestamp, message });

    if (this.logEntries.length > 20) {
      this.logEntries = this.logEntries.slice(-20);
    }
  }

  clearLog() {
    this.logEntries = [];
  }

  // LocalStorage methods
  private checkStoredConnection() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const connectionInfo: StoredConnectionInfo = JSON.parse(stored);
      const now = Date.now();

      // Check if connection has expired
      if (now - connectionInfo.timestamp > this.CONNECTION_EXPIRY) {
        this.clearStoredConnection();
        this.log('Stored connection expired');
        return;
      }

      // Restore connection
      this.log('Found stored connection, attempting to restore...');
      this.username = connectionInfo.user.displayName;
      this.classroomCode = connectionInfo.channel.code;
      this.restoreConnection(connectionInfo);

    } catch (error) {
      this.log('Failed to restore stored connection');
      this.clearStoredConnection();
    }
  }

  private async restoreConnection(connectionInfo: StoredConnectionInfo) {
    try {
      this.isLoading = true;
      this.currentStep = 2; // Show loading state

      // Restore user locally
      this.currentUserSubject.next(connectionInfo.user);
      this.log(`Restored user: ${connectionInfo.user.username}`);

      // Connect to peer network
      const peerId = await this.peerService.connectToPeerServer();
      this.log('Reconnected to peer network');

      // Rejoin the channel by code
      this.channelService.getChannelByCode(connectionInfo.channel.code).then((channel: any) => {
        this.channelService.joinChannel(channel.id, (connectionInfo.user as any).id, peerId).then(() => {
          this.currentChannel = channel;
          this.currentStep = 3;
          this.log(`Rejoined classroom: ${channel.name}`);
          this.isLoading = false;

          // Update stored info with fresh data
          this.saveConnection(connectionInfo.user as any, channel as any);
        }).catch((error: any) => {
          this.log('Failed to rejoin classroom: ' + (error.error?.message || error.message));
          this.showError('Failed to restore previous session. Please start over.');
          this.clearStoredConnection();
          this.currentStep = 1;
          this.isLoading = false;
        });
      }).catch((error: any) => {
        this.log('Failed to rejoin classroom: ' + (error.error?.message || error.message));
        this.showError('Failed to restore previous session. Please start over.');
        this.clearStoredConnection();
        this.currentStep = 1;
        this.isLoading = false;
      });

    } catch (error: any) {
      this.log('Failed to restore connection: ' + (error.message || 'Unknown error'));
      this.showError('Failed to restore previous session. Please start over.');
      this.clearStoredConnection();
      this.currentStep = 1;
      this.isLoading = false;
    }
  }

  private saveConnection(user: User, channel: Channel) {
    try {
      const connectionInfo: StoredConnectionInfo = {
        user,
        channel,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connectionInfo));
      this.log('Connection info saved');
    } catch (error) {
      this.log('Failed to save connection info');
    }
  }

  private clearStoredConnection() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Enhanced reconnection button
  reconnect() {
    if (!this.currentChannel) return;

    this.isLoading = true;
    this.log('Attempting to reconnect...');

    this.peerService.connectToPeerServer().then(() => {
      this.log('Reconnected to peer network');
      this.isLoading = false;
    }).catch(() => {
      this.showError('Failed to reconnect to peer network');
      this.isLoading = false;
    });
  }
}
