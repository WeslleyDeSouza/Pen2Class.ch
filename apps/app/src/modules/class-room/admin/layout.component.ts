import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <router-outlet/>
    </div>
  `
})
export class AdminLayoutComponent {}
