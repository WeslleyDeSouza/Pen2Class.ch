import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Classroom as Channel} from '../../../common';
import {ClassroomService} from '../../../common/services/classroom.service';
import {UserService, UserType} from '../../../common/services/user.service';

@Component({
  selector: 'app-create-steps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Progress Steps -->
      <div class="flex items-center justify-center mb-6">
        <div class="flex items-center space-x-2">
          <div [class]="createStep >= 1 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
          <div [class]="createStep >= 2 ? 'w-8 h-1 bg-blue-500' : 'w-8 h-1 bg-gray-300'"></div>
          <div [class]="createStep >= 2 ? 'w-4 h-4 bg-blue-500 rounded-full' : 'w-4 h-4 bg-gray-300 rounded-full'"></div>
        </div>
      </div>

      @if (errorMessage) {
        <div class="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{{ errorMessage }}</div>
      }

      @if (createStep === 1) {
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Your name</label>
            <input
              [(ngModel)]="teacherName"
              placeholder="Teacher display name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Classroom name</label>
            <input
              [(ngModel)]="classroomName"
              placeholder="E.g. Algebra 101"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              (keyup.enter)="createClassroom()">
          </div>

          <button
            (click)="createClassroom()"
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
            <h3 class="text-lg font-semibold text-blue-800 mb-1">Classroom created!</h3>
            <p class="text-sm text-blue-600">{{currentChannel?.name}}</p>
            <p class="text-xs text-blue-500 mt-1">Share the code with your students from the admin panel.</p>
          </div>

          <button
            (click)="goToAdmin.emit()"
            class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Go to Admin Dashboard
          </button>
        </div>
      }

      <div class="flex space-x-3">
        @if (createStep > 1) {
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
  `
})
export class StepCreateComponent {
  // Local state managed inside the component
  createStep = 1;
  teacherName = '';
  classroomName = '';
  isLoading = false;
  currentChannel: Channel | null = null;
  errorMessage = '';

  @Output() back = new EventEmitter<void>();
  @Output() goToAdmin = new EventEmitter<void>();

  constructor(
    private channelService: ClassroomService,
    private userService: UserService,
  ) {}

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  private clearError() {
    this.errorMessage = '';
  }

  async createClassroom() {
    if (!this.teacherName.trim() || !this.classroomName.trim()) {
      this.showError('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    this.clearError();

    try {
      const user = await this.userService.signup(
        this.teacherName.trim(),
        undefined,
        this.teacherName.trim(),
        UserType.TEACHER,
      );

      const channel = await this.channelService.createClassroom(
        this.classroomName.trim(),
        '',
        user?.id,
      );

      this.currentChannel = channel;
      this.createStep = 2;
      this.isLoading = false;
    } catch (error: any) {
      this.showError(error.error?.message || 'Failed to create classroom or teacher account');
      this.isLoading = false;
    }
  }

  onPrevious() {
    if (this.createStep === 2) {
      this.createStep = 1;
      this.clearError();
    }
  }
}
