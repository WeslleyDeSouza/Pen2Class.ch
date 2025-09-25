import {computed, inject, Injectable, signal} from "@angular/core";


@Injectable({ providedIn: 'root' })
export class UserStoreService {
  user = signal<{id?:string,displayName?:string} | undefined>(undefined);

  selectedClassId = signal<string | null>(null);

  selectedLessonId = signal<string | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  getCurrentUser(){
    return this.user();
  }

  persist(){
    const userData = this.user();
    if (userData) {
      localStorage.setItem('pen2class_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('pen2class_user');
    }
  }

  private loadFromStorage() {
    const storedUser = localStorage.getItem('pen2class_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.user.set(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('pen2class_user');
      }
    }
  }
}
