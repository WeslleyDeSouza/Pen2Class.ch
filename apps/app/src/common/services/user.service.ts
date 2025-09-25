import { Injectable } from '@angular/core';
import {UserService as UserApiService, UserDto, UserChannelDto} from '@ui-lib/apiClient';
import { environment } from '../../environments/environment';
import {UserStoreService} from "../store";

export enum UserType {
  STUDENT = 1,
  TEACHER = 2
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly rootUrl = environment.apiUrl;

  constructor(
    private userApiService: UserApiService,
    private userStore: UserStoreService,
  ) {
    userApiService.rootUrl = this.rootUrl;
  }

  signup(username: string, email: string | undefined, displayName: string, type:UserType): Promise<UserDto> {
    return (
      this.userApiService.userSignup({
        body: { username, email, displayName, type:type   }
      }).then(res => {
        this.userStore.user.set(res);
        this.userStore.persist();
        return res
      })
    )
  }

  getUsers(): Promise<UserDto[]> {
    return (this.userApiService.userGetAllUsers())
  }

  getUser(userId: string): Promise<UserDto> {
    return (this.userApiService.userGetUser({ userId }))
  }

  getCurrentUser(userId: string): Promise<UserDto> {
    return (this.userApiService.userGetCurrentUser({ userId }))
  }

  getUserChannels(userId: string): Promise<UserChannelDto[]> {
    return (this.userApiService.userGetUserChannels({ userId }))
  }

  //
  getUserFromStore() {
    return (this.userStore.getCurrentUser())
  }
}
