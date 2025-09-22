import { Injectable } from '@angular/core';
import {UserService as UserApiService, UserDto, SignupUserDto,UserChannelDto} from '@ui-lib/apiClient';
import { environment } from '../../environments/environment';

// @ts-ignore
export interface User extends UserDto {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  createdAt: string | Date;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly rootUrl = environment.apiUrl;

  constructor(private userApiService: UserApiService) {
    userApiService.rootUrl = this.rootUrl;
  }

  signup(username: string, email?: string, displayName?: string): Promise<UserDto> {
    return (
      this.userApiService.userSignup({
        body: { username, email, displayName }
      })
    )
  }

  getUsers(): Promise<UserDto[]> {
    return (this.userApiService.userGetAllUsers())
  }

  getUser(userId: string): Promise<UserDto> {
    return (this.userApiService.userGetUser({ userId }))
  }

  getUserChannels(userId: string): Promise<UserChannelDto[]> {
    return (this.userApiService.userGetUserChannels({ userId }))
  }
}
