import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { Router} from '@angular/router';
import {UserService} from '../../common/services/user.service';
import {StepJoinComponent} from './components/step.join.component';
import {StepCreateComponent} from './components/step.create.component';
import {StepContinueComponent} from './components/step.continue.component';
import {HomeHeaderComponent} from './components/home.header.component';
import {RouteConstants} from "../../app/route.constants";

import {UserStoreService} from "../../common/store";
import {Classroom as Channel} from '../../common';

type ViewMode = 'initial' | 'login' | 'joinByCode' | 'createClass' | 'hasError';

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
              <div>
                <button
                  (click)="switchToJoinByCodeStep()"
                  class="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Join by Code</span>
                </button>
              </div>

              <!-- Create Classroom Button -->
              <div>
                <button
                  (click)="switchToCreateClassStep()"
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Create Classroom</span>
                </button>
              </div>

              <!-- Login Button -->
              <div>
                <button
                  (click)="switchToLoginStep()"
                  class="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Login</span>
                </button>
              </div>

              <!-- Continue with existing user Button -->
              @if (hasExistingUser()) {
                <div>
                  <app-continue-existing-user
                    [existingUserName]="getExistingUserName()"
                    (continueClicked)="continueWithExistingUser()"
                  />
                </div>
              }

            </div>
          }
          @case ('login') {
            <div class="space-y-4 animate-fade-in">
              <h2 class="text-xl font-semibold text-gray-800 text-center mb-6">Login to your account</h2>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  [(ngModel)]="loginEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  (keyup.enter)="loginPassword.focus()">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  [(ngModel)]="loginPassword"
                  type="password"
                  placeholder="Enter your password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  #loginPassword
                  (keyup.enter)="loginUser()">
              </div>

              <button
                (click)="loginUser()"
                [disabled]="!isLoginFormValid() || isLoading"
                class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>

              <button
                (click)="switchToInitialStep()"
                class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors border border-gray-200 hover:border-gray-300 rounded-lg">
                Back to Home
              </button>
            </div>
          }
          @case ('joinByCode') {
            <app-join-steps
              (back)="switchToInitialStep()"
            />
          }
          @case ('createClass') {
            <app-create-steps
              (back)="switchToInitialStep()"
              (goToAdmin)="goToAdmin()"
            />
          }
          @case ('hasError') {
            <div class="space-y-4 animate-fade-in text-center">
              <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
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
                (click)="switchToInitialStep()"
                class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors">
                Go Back
              </button>
            </div>
          }
        }

        <!-- Error Messages -->
        @if (errorMessage) {
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>
        }
      </div>
    </div>

    <style>
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  `,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class HomeComponent  {
  currentView: ViewMode = 'initial';
  joinStep = 1;
  createStep = 1;

  // State
  errorMessage = '';
  isLoading = false;
  currentChannel: Channel | null = null;

  // Login form state
  loginEmail = '';
  loginPassword = '';

  constructor(
    private userService: UserService,
    private userStore: UserStoreService,
    private router: Router,
  ) {}

  // Navigation methods
  switchToJoinByCodeStep() {
    this.resetStepsState();
    this.currentView = 'joinByCode';
   }

  switchToCreateClassStep() {
    this.resetStepsState();
    this.currentView = 'createClass';

  }

  switchToLoginStep() {
    this.resetStepsState();
    this.currentView = 'login';
  }

  switchToInitialStep() {
    this.resetStepsState();
    this.currentView = 'initial';
  }

  // Helper methods
  private resetStepsState() {
    this.joinStep = 1;
    this.createStep = 1;
    this.currentChannel = null;
    this.loginEmail = '';
    this.loginPassword = '';
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

  isLoginFormValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.loginEmail) && this.loginPassword.length > 0;
  }

  loginUser() {
    if (!this.isLoginFormValid()) {
      this.showError('Please enter a valid email and password');
      return;
    }

    this.isLoading = true;
    this.clearError();

    this.userService.login(this.loginEmail.trim(), this.loginPassword).then((response) => {
      // Store user data and session
      this.userStore.user.set(response.user);
      this.userStore.persist();

      // Redirect based on user type
      if (response.user.type === 2) {
        this.goToAdmin();
      } else {
        this.goToClassRoom();
      }

      this.isLoading = false;
    }).catch((error) => {
      this.showError(error.error?.message || 'Login failed. Please check your credentials.');
      this.isLoading = false;
    });
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
