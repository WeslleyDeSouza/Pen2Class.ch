import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home-header',
  standalone: true,
  template: `
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
      <p class="text-gray-600 mt-2">{{ subtitle }}</p>
    </div>
  `,
})
export class HomeHeaderComponent {
  @Input() title: string = 'Pen2Class';
  @Input() subtitle: string = 'Join or create a classroom';
}
