import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Channel, User } from '../../common';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ChannelService } from '../../common/services/channel.service';
import { UserService } from '../../common/services/user.service';
import {ChannelDto, UserDto} from "@ui-lib/apiClient";

declare var Peer: any;

type ViewMode = 'initial' | 'joinByCode' | 'createClass' | 'hasError';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Pen2Class</h1>
          <p class="text-gray-600 mt-2">Join or create a classroom</p>
        </div>

        @switch (currentView) {
          @case ('initial') {
            <div class="space-y-4 animate-fade-in">
              <!-- Join by Code Button -->
              <button
                (click)="switchToJoinByCode()"
                class="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>Join by Code</span>
              </button>

              <!-- Create Classroom Button -->
              <button
                (click)="switchToCreateClass()"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Create Classroom</span>
              </button>
            </div>
          }

          @case ('joinByCode') {
            <div class="space-y-6 animate-fade-in">
              <!-- Progress Steps -->
              <div class="flex items-center justify-center mb-6">
                <div class="flex items-center space-x-2">
                  <div [class]="joinStep >= 1 ? 'w-4 h-4 bg-green-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                  <div [class]="joinStep >= 2 ? 'w-8 h-1 bg-green-500' : 'w-8 h-1 bg-gray-300'"></div>
                  <div [class]="joinStep >= 2 ? 'w-4 h-4 bg-green-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                  <div [class]="joinStep >= 3 ? 'w-8 h-1 bg-green-500' : 'w-8 h-1 bg-gray-300'"></div>
                  <div [class]="joinStep >= 3 ? 'w-4 h-4 bg-green-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                </div>
              </div>

              @if (joinStep === 1) {
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Enter your name</label>
                    <input
                      [(ngModel)]="username"
                      placeholder="Your display name"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      (keyup.enter)="nextJoinStep()">
                  </div>
                  <button
                    (click)="nextJoinStep()"
                    [disabled]="!username.trim() || isLoading"
                    class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    {{ isLoading ? 'Creating user...' : 'Continue' }}
                  </button>
                </div>
              }

              @if (joinStep === 2) {
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Enter classroom code</label>
                    <input
                      [(ngModel)]="classroomCode"
                      placeholder="Enter 6-digit code"
                      maxlength="6"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                      (keyup.enter)="joinClassroom()"
                      (input)="onCodeInput($event)">
                  </div>
                  <button
                    (click)="joinClassroom()"
                    [disabled]="!isValidCode() || isLoading"
                    class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    {{ isLoading ? 'Joining...' : 'Join Classroom' }}
                  </button>
                </div>
              }

              @if (joinStep === 3 && currentChannel) {
                <div class="space-y-4">
                  <div class="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-green-800 mb-1">Successfully joined!</h3>
                    <p class="text-sm text-green-600">{{currentChannel.name}}</p>
                  </div>
                </div>
              }

              <div class="flex space-x-3">
                @if (joinStep > 1) {
                  <button
                    (click)="previousJoinStep()"
                    class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors border border-gray-200 hover:border-gray-300 rounded-lg">
                    Back
                  </button>
                }
                <button
                  (click)="goToInitial()"
                  class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          }

          @case ('createClass') {
            <div class="space-y-6 animate-fade-in">
              <!-- Progress Steps -->
              <div class="flex items-center justify-center mb-6">
                <div class="flex items-center space-x-2">
                  <div [class]="createStep >= 1 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                  <div [class]="createStep >= 2 ? 'w-8 h-1 bg-blue-500' : 'w-8 h-1 bg-gray-300'"></div>
                  <div [class]="createStep >= 2 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                  <div [class]="createStep >= 3 ? 'w-8 h-1 bg-blue-500' : 'w-8 h-1 bg-gray-300'"></div>
                  <div [class]="createStep >= 3 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
                </div>
              </div>

              @if (createStep === 1) {
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                    <input
                      [(ngModel)]="teacherName"
                      placeholder="Your display name"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      (keyup.enter)="nextCreateStep()">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Classroom name</label>
                    <input
                      [(ngModel)]="classroomName"
                      placeholder="Enter classroom name"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      (keyup.enter)="nextCreateStep()">
                  </div>
                  <button
                    (click)="nextCreateStep()"
                    [disabled]="!teacherName.trim() || !classroomName.trim() || isLoading"
                    class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    {{ isLoading ? 'Creating...' : 'Create Classroom' }}
                  </button>
                </div>
              }

              @if (createStep === 2 && currentChannel) {
                <div class="space-y-4">
                  <div class="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-blue-800 mb-1">Classroom Created!</h3>
                    <p class="text-sm text-blue-600">{{currentChannel.name}}</p>
                  </div>

                  <!-- Classroom Info -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900 mb-2">Classroom Details</h4>
                    <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex justify-between">
                        <span>Share this code with students:</span>
                      </div>
                      <div class="text-center">
                        <code class="bg-white px-4 py-3 rounded border text-2xl font-mono tracking-widest">{{currentChannel.code}}</code>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <div class="flex space-x-3">
                @if (createStep > 1) {
                  <button
                    (click)="previousCreateStep()"
                    class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors border border-gray-200 hover:border-gray-300 rounded-lg">
                    Back
                  </button>
                }
                @if(currentChannel?.name){
                  <button

                    (click)="goToAdmin()"
                    class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
                    Go to Admin
                  </button>
                }

              </div>
            </div>
          }

          @case ('hasError') {
            <div class="space-y-4 animate-fade-in text-center">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-red-800">Server Not Available</h3>
              <p class="text-sm text-red-600">Unable to connect to the peer server. Please try again later.</p>
              <button
                (click)="retryConnection()"
                [disabled]="isLoading"
                class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                {{ isLoading ? 'Retrying...' : 'Retry Connection' }}
              </button>
              <button
                (click)="goToInitial()"
                class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
                Go Back
              </button>
            </div>
          }
        }

        <!-- Connection Status -->
        @if (currentView !== 'initial' && currentView !== 'hasError') {
          <div class="mt-6 p-3 rounded-lg border" [class]="isConnectedToPeer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full" [class]="isConnectedToPeer ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm font-medium" [class]="isConnectedToPeer ? 'text-green-800' : 'text-red-800'">
                {{ isConnectedToPeer ? 'Connected to peer network' : 'Disconnected' }}
              </span>
            </div>
          </div>
        }

        <!-- Error Messages -->
        @if (errorMessage) {
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p class="text-sm text-red-800">{{errorMessage}}</p>
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
export class HomeComponent implements OnInit, OnDestroy {
  currentView: ViewMode = 'initial';
  joinStep = 1;
  createStep = 1;

  // Form data
  username = '';
  classroomCode = '';
  teacherName = '';
  classroomName = '';

  // State
  errorMessage = '';
  isLoading = false;
  isConnectedToPeer = false;
  currentChannel: Channel | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPeerJS();
    this.checkPeerServerConnection();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadPeerJS() {
    if (typeof Peer === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.0/dist/peerjs.min.js';
      document.head.appendChild(script);
    }
  }

  private checkPeerServerConnection() {
    // Try to connect to peer server to check availability
    try {
      const testPeer = new Peer();

      testPeer.on('open', () => {
        this.isConnectedToPeer = true;
        testPeer.destroy();
      });

      testPeer.on('error', () => {
        this.isConnectedToPeer = false;
        if (this.currentView !== 'initial') {
          this.currentView = 'hasError';
        }
        testPeer.destroy();
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.isConnectedToPeer && this.currentView !== 'initial') {
          this.currentView = 'hasError';
        }
        testPeer.destroy();
      }, 5000);

    } catch (error) {
      this.isConnectedToPeer = false;
      if (this.currentView !== 'initial') {
        this.currentView = 'hasError';
      }
    }
  }

  // Navigation methods
  switchToJoinByCode() {
    this.resetForm();
    this.currentView = 'joinByCode';
    this.checkPeerServerConnection();
  }

  switchToCreateClass() {
    this.resetForm();
    this.currentView = 'createClass';
    this.checkPeerServerConnection();
  }

  goToInitial() {
    this.resetForm();
    this.currentView = 'initial';
  }

  retryConnection() {
    this.isLoading = true;
    this.checkPeerServerConnection();
    setTimeout(() => {
      this.isLoading = false;
      if (this.isConnectedToPeer) {
        this.currentView = 'initial';
      }
    }, 3000);
  }

  // Join by code flow
  nextJoinStep() {
    if (this.joinStep === 1) {
      this.createUser();
    }
  }

  previousJoinStep() {
    if (this.joinStep === 2) {
      this.joinStep = 1;
      this.clearError();
    }
  }

  private createUser() {
    if (!this.username.trim()) {
      this.showError('Please enter your name');
      return;
    }

    this.isLoading = true;
    this.clearError();

    this.userService.signup(this.username.trim(), undefined, this.username.trim()).then((user) => {
      this.joinStep = 2;
      this.isLoading = false;
    }).catch((error) => {
      this.showError(error.error?.message || 'Failed to create user');
      this.isLoading = false;
    });
  }

  onCodeInput(event: any) {
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
    this.clearError();

    this.channelService.getChannelByCode(this.classroomCode).then((channel) => {
      this.currentChannel = channel;
      this.joinStep = 3;
      this.isLoading = false;

      setTimeout(()=> this.goToHome(),1000);
    }).catch((error) => {
      let errorMessage = 'Failed to join classroom';
      if (error.status === 404) {
        errorMessage = 'Classroom not found. Please check the code and try again.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      this.showError(errorMessage);
      this.isLoading = false;
    });
  }

  // Create classroom flow
  nextCreateStep() {
    if (this.createStep === 1) {
      this.createClassroom();
    }
  }

  previousCreateStep() {
    if (this.createStep === 2) {
      this.createStep = 1;
      this.clearError();
    }
  }

  private async createClassroom() {
    if (!this.teacherName.trim() || !this.classroomName.trim()) {
      this.showError('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    this.clearError();

    try {
      // First create the teacher user
      const user = await this.userService.signup(this.teacherName.trim(), undefined, this.teacherName.trim());

      // Then create the channel
      const channel = await this.channelService.createChannel(
        this.classroomName.trim(), '',user?.id);

      this.currentChannel = channel;
      this.createStep = 2;
      this.isLoading = false;
    } catch (error: any) {
      this.showError(error.error?.message || 'Failed to create classroom or teacher account');
      this.isLoading = false;
    }
  }

  // Helper methods
  private resetForm() {
    this.username = '';
    this.classroomCode = '';
    this.teacherName = '';
    this.classroomName = '';
    this.joinStep = 1;
    this.createStep = 1;
    this.currentChannel = null;
    this.clearError();
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private clearError() {
    this.errorMessage = '';
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
  goToHome() {
    this.router.navigate(['/class-room']);
  }
}
