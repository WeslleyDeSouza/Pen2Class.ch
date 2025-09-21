import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: ChannelMember[];
}

export interface ChannelMember {
  userId: string;
  peerId: string;
  joinedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // User endpoints
  signup(username: string, email?: string, displayName?: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/signup`, {
      username,
      email,
      displayName
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${userId}`);
  }

  getUserChannels(userId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.baseUrl}/users/${userId}/channels`);
  }

  // Channel endpoints
  createChannel(name: string, description?: string, createdBy?: string): Observable<Channel> {
    return this.http.put<Channel>(`${this.baseUrl}/channels`, {
      name,
      description,
      createdBy
    });
  }

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.baseUrl}/channels`);
  }

  getChannel(channelId: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.baseUrl}/channels/${channelId}`);
  }

  joinChannel(channelId: string, userId: string, peerId: string): Observable<{ success: boolean; channel: Channel }> {
    return this.http.post<{ success: boolean; channel: Channel }>(`${this.baseUrl}/channels/${channelId}/join`, {
      userId,
      peerId
    });
  }

  leaveChannel(channelId: string, userId: string): Observable<{ success: boolean; channel: Channel }> {
    return this.http.post<{ success: boolean; channel: Channel }>(`${this.baseUrl}/channels/${channelId}/leave`, {
      userId
    });
  }

  getChannelMembers(channelId: string): Observable<ChannelMember[]> {
    return this.http.get<ChannelMember[]>(`${this.baseUrl}/channels/${channelId}/members`);
  }

  deleteChannel(channelId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/channels/${channelId}`);
  }
}
