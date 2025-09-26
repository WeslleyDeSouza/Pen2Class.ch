import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Classroom} from '../../../common';
import {ClassroomService} from '../../../common/services/classroom.service';
import {UserService, UserType} from '../../../common/services/user.service';
import {Router} from '@angular/router';
import {RouteConstants} from '../../../app/route.constants';
import {UserStoreService} from "../../../common/store";

@Component({
  selector: 'app-join-steps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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

      @if (errorMessage) {
        <div class="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{{ errorMessage }}</div>
      }

      @if (joinStep === 1) {
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Enter your email</label>
            <input
              [(ngModel)]="username"
              type="email"
              placeholder="your.email@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              [class.border-red-300]="!isValidEmail() && username.length > 0"
              (keyup.enter)="passwordField.focus()">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              [(ngModel)]="password"
              type="password"
              placeholder="Enter your password (min 8 characters)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              [class.border-red-300]="password.length > 0 && password.length < 8"
              #passwordField
              (keyup.enter)="confirmPasswordField.focus()">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              [(ngModel)]="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              [class.border-red-300]="$any(confirmPassword).length > 0 && password !== confirmPassword"
              #confirmPasswordField
              (keyup.enter)="createUser()">
          </div>

          @if (!isValidEmail() && username.length > 0) {
            <div class="text-red-600 text-sm">Please enter a valid email address</div>
          }
          @if (password.length > 0 && password.length < 8) {
            <div class="text-red-600 text-sm">Password must be at least 8 characters</div>
          }
          @if (confirmPassword.length > 0 && password !== confirmPassword) {
            <div class="text-red-600 text-sm">Passwords do not match</div>
          }

          <button
            (click)="createUser()"
            [disabled]="!isFormValid() || isLoading"
            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </div>
      }
{{joinStep}}
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

      @if (joinStep === 3 && currentClassroom) {
        <div class="space-y-4">
          <div class="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-800 mb-1">Successfully joined!</h3>
            <p class="text-sm text-green-600">{{ currentClassroom?.name }}</p>
          </div>
        </div>
      }

      <div class="flex space-x-3">
        @if (joinStep > 1) {
          <button
            (click)="onPrevious()"
            class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors border border-gray-200 hover:border-gray-300 rounded-lg">
            Back
          </button>
        }
        <button
          (click)="back.emit()"
          class="flex-1 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors border border-gray-200 hover:border-gray-300 rounded-lg">
          Home
        </button>
      </div>
    </div>
  `,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class StepJoinComponent {
  // Local state managed inside the component
  joinStep = 1;
  username = '';
  password = '';
  confirmPassword = '';
  classroomCode = '';
  isLoading = false;
  currentClassroom: Classroom | null = null;
  errorMessage = '';

  @Output() back = new EventEmitter<void>();

  protected cdr = inject(ChangeDetectorRef);

  constructor(
    private channelService: ClassroomService,
    private userService: UserService,
    private userStore: UserStoreService,
    private router: Router,
  ) {}

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  private clearError() {
    this.errorMessage = '';
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.username);
  }

  isFormValid(): boolean {
    return this.isValidEmail() &&
           this.password.length >= 8 &&
           this.password === this.confirmPassword;
  }

  createUser() {
    if (!this.isFormValid()) {
      this.showError('Please fill in all fields correctly');
      return;
    }
    this.isLoading = true;
    this.clearError();

    this.userService
      .signup(this.username.trim(), this.password, this.username.trim(), this.username.trim(), UserType.STUDENT)
      .then(() => {
        console.log('User created successfully');
        this.joinStep = 2;
        this.isLoading = false;
        this.userStore.persist();
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.showError(error.error?.message || 'Failed to create account');
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

    this.channelService
      .joinClassroomByCode(
        this.classroomCode,
        this.userService.getUserFromStore()?.id as string,
        this.userService.getUserFromStore()?.displayName as string,
      )
      .then((res) => {
        this.currentClassroom = res.classroom;
        this.joinStep = 3;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/', RouteConstants.Paths.classroom]), 1000);
        this.cdr.detectChanges();
      })
      .catch((error) => {
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

  onPrevious() {
    if (this.joinStep === 2) {
      this.joinStep = 1;
      this.clearError();
    }
    this.cdr.detectChanges();
  }
}
