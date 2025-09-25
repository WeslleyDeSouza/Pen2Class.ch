import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-continue-existing-user',
  standalone: true,
  template: `
      <button
        (click)="onContinue()"
        class="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span>Continue with {{ existingUserName }}</span>
      </button>
  `
})
export class StepContinueComponent {

  @Input() existingUserName = 'User';

  @Output() continueClicked = new EventEmitter<void>();

  onContinue() {
    this.continueClicked.emit();
  }
}
