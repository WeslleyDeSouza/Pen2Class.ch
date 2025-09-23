import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChannelService as ChannelApiService, ChannelDto ,
  ChannelMemberDto,
  JoinLeaveResponseDto,
  SuccessResponseDto} from '@ui-lib/apiClient';


export interface Channel extends ChannelDto{}

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly rootUrl = environment.apiUrl;

  constructor(protected channelApiService: ChannelApiService) {
    this.channelApiService.rootUrl = this.rootUrl;
  }

  createChannel(name: string, description: string | undefined, createdBy: string): Promise<ChannelDto> {
    const promise = this.channelApiService.channelCreateChannel({
      body: { name, description: description ?? undefined, createdBy }
    })
    return (promise);
  }

  getChannels(): Promise<Channel[]> {
    const promise = this.channelApiService.channelGetAllChannels({}) as unknown as Promise<Channel[]>;
    return (promise);
  }

  getChannelsFromUser(userId:string): Promise<Channel[]> {
    const promise = this.channelApiService.channelGetAllChannelsWithPermission({userId}) as unknown as Promise<Channel[]>;
    return (promise);
  }

  getChannel(channelId: string): Promise<ChannelDto> {
    const promise = this.channelApiService.channelGetChannel({ channelId })
    return (promise);
  }

  joinChannel(channelId: string, userId: string, peerId: string, displayName:string): Promise<JoinLeaveResponseDto> {
    const promise = this.channelApiService.channelJoinChannel({
      channelId,
      body: { userId, peerId ,displayName}
    })
    return (promise);
  }

  leaveChannel(channelId: string, userId: string): Promise<JoinLeaveResponseDto> {
    const promise = this.channelApiService.channelLeaveChannel({
      channelId,
      body: { userId }
    })
    return (promise);
  }

  getChannelMembers(channelId: string): Promise<ChannelMemberDto[]> {
    const promise = this.channelApiService.channelGetChannelMembers({ channelId })
    return (promise);
  }

  getChannelByCode(code: string): Promise<Channel> {
    const promise = this.channelApiService.channelGetChannelByCode({ code }) as unknown as Promise<Channel>;
    return (promise);
  }

  joinByCode(code: string, userId: string, peerId: string,displayName:string): Promise<JoinLeaveResponseDto> {
    return  this.channelApiService.channelJoinChannelByCode({
      body: { code, userId, peerId ,displayName}
    })
  }

  deleteChannel(channelId: string): Promise<SuccessResponseDto> {
    const promise = this.channelApiService.channelDeleteChannel({ channelId })
    return (promise);
  }
}
