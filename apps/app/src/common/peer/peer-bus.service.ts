import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Lightweight global event bus to decouple components/services from window event APIs
// Usage:
//  - eventBus.emit('channelMessage', payload)
//  - const sub = eventBus.on<'YourType'>('channelMessage').subscribe(handler)
//  - sub.unsubscribe() in ngOnDestroy

@Injectable({ providedIn: 'root' })
export class PeerBusService {
  private channels = new Map<string, Subject<any>>();

  on<T = any>(eventName: string): Observable<T> {
    let subject = this.channels.get(eventName);
    if (!subject) {
      subject = new Subject<any>();
      this.channels.set(eventName, subject);
    }
    return subject.asObservable();
  }

  emit<T = any>(eventName: string, payload: T): void {
    let subject = this.channels.get(eventName);
    if (!subject) {
      subject = new Subject<any>();
      this.channels.set(eventName, subject);
    }
    subject.next(payload);
  }

  // Optional manual cleanup if a channel is no longer needed
  off(eventName: string): void {
    const subject = this.channels.get(eventName);
    if (subject) {
      subject.complete();
      this.channels.delete(eventName);
    }
  }
}
