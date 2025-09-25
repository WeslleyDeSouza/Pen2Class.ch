import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import { Channel, User } from '../../common';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ChannelService } from '../../common/services/channel.service';
import { UserService, UserType } from '../../common/services/user.service';
import {PeerService, PeerUserStoreService} from '../../common/peer/peer.service';
import {ChannelDto, UserDto} from "@ui-lib/apiClient";
import {RouteConstants} from "../../app/route.constants";
import { StepJoinComponent } from './components/step.join.component';
import { StepCreateComponent } from './components/step.create.component';
import { StepContinueComponent } from './components/step.continue.component';
import { HomeHeaderComponent } from './components/home.header.component';


type ViewMode = 'initial' | 'joinByCode' | 'createClass' | 'hasError';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, StepJoinComponent, StepCreateComponent, StepContinueComponent, HomeHeaderComponent ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <app-home-header></app-home-header>

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

              <!-- Continue with existing user Button -->
              @if(hasExistingUser()){
                <app-continue-existing-user
                  [existingUserName]="getExistingUserName()"
                  (continueClicked)="continueWithExistingUser()"
                ></app-continue-existing-user>
              }

            </div>
          }

          @case ('joinByCode') {
            <app-join-steps
              (back)="goToInitial()"
            />
          }

          @case ('createClass') {
            <app-create-steps
              (back)="goToInitial()"
              (goToAdmin)="goToAdmin()"
            />
          }

          @case ('hasError') {
            <div class="space-y-4 animate-fade-in text-center">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>

              <h3 class="text-lg font-semibold text-red-800">
               Error Message</h3>
              <p class="text-sm text-red-600">

              </p>

              <!--
               <button
                [disabled]="isLoading"
                class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              </button>
              -->
              <button
                (click)="goToInitial()"
                class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
                Go Back
              </button>
            </div>
          }
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
    private userStore: PeerUserStoreService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Navigation methods
  switchToJoinByCode() {
    this.resetForm();
    this.currentView = 'joinByCode';
   }

  switchToCreateClass() {
    this.resetForm();
    this.currentView = 'createClass';

  }

  goToInitial() {
    this.resetForm();
    this.currentView = 'initial';
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

  createUser() {
    if (!this.username.trim()) {
      this.showError('Please enter your name');
      return;
    }

    this.isLoading = true;
    this.clearError();

    this.userService.signup(this.username.trim(), undefined, this.username.trim(), UserType.STUDENT).then((user) => {
      this.joinStep = 2;
      this.isLoading = false;
      this.userStore.persist();
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

  async joinClassroom() {
    if (!this.isValidCode()) {
      this.showError('Please enter a valid 6-digit classroom code');
      return;
    }

    this.isLoading = true;
    this.clearError();

    await this.channelService.joinByCode(
      this.classroomCode,
      this.userService.getUserFromStore()?.id as string,
      this.userService.getUserFromStore()?.displayName as string,
    ).then((res) => {
      this.currentChannel = res.channel;
      this.joinStep = 3;
      this.isLoading = false;

      setTimeout(()=> this.goToClassRoom(),1000);
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
      const user = await this.userService.signup(this.teacherName.trim(), undefined, this.teacherName.trim(), UserType.TEACHER);

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
    this.router.navigate(['/', RouteConstants.Paths.admin, RouteConstants.Paths.dashboard]);
  }
  goToClassRoom() {
    this.router.navigate(['/', RouteConstants.Paths.classroom]);
  }

  hasExistingUser(): boolean {
    const user = this.userStore.getCurrentUser();
    return user && user.id ? true : false;
  }

  getExistingUserName(): string {
    const user = this.userStore.getCurrentUser() as any;
    return user?.displayName || user?.username || 'User';
  }

  continueWithExistingUser() {
    const storedUser = this.userStore.getCurrentUser();
    if (!storedUser?.id) {
      return;
    }

    this.isLoading = true;
    this.clearError();

    this.userService.getCurrentUser(storedUser.id).then((user) => {
      // User still exists, update stored data and continue
      this.userStore.user.set(user);
      this.userStore.persist();

      if(user.type == 2)this.goToAdmin();
      else this.goToClassRoom();

      this.isLoading = false;
    }).catch((error) => {
      // User no longer exists, remove from storage
      this.userStore.user.set(undefined);
      this.userStore.persist();
      this.showError('User no longer exists. Please create a new account.');
      this.isLoading = false;
    });
  }
}
