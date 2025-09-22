import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  ChannelTypesService as ChannelTypesApiService,
  ChannelTypeDto,
  SuccessDto, CreateChannelTypeDto,
} from '@ui-lib/apiClient';

export interface ChannelType extends ChannelTypeDto {}

@Injectable({ providedIn: 'root' })
export class ChannelTypesService {
  private readonly rootUrl = environment.apiUrl;

  constructor(private channelTypesApi: ChannelTypesApiService) {
    this.channelTypesApi.rootUrl = this.rootUrl;
  }

  // List all channel types for a given channel
  list(channelId: string): Promise<ChannelType[]> {
    return this.channelTypesApi.channelTypeList({ channelId }) as unknown as Promise<ChannelType[]>;
  }

  // Create a new channel type
  create(channelId: string, body: CreateChannelTypeDto): Promise<ChannelTypeDto> {
    console.log({ channelId, body:{
        createdBy: body.createdBy,
        description: body.description,
        name: body.name
      } });

    return this.channelTypesApi.channelTypeCreate({ channelId, body:{
        createdBy: body.createdBy,
        description: body.description,
        name: body.name
      } });
  }

  // Get a specific channel type
  get(channelId: string, typeId: string): Promise<ChannelTypeDto> {
    return this.channelTypesApi.channelTypeGet({ channelId, typeId });
  }

  // Update a channel type
  update(
    channelId: string,
    typeId: string,
    body: { name?: string; description?: string; visible?: boolean }
  ): Promise<ChannelTypeDto> {
    return this.channelTypesApi.channelTypeUpdate({ channelId, typeId, body });
  }

  // Delete a channel type
  delete(channelId: string, typeId: string): Promise<SuccessDto> {
    return this.channelTypesApi.channelTypeDelete({ channelId, typeId, body: {} });
  }

  // Enable a channel type
  enable(channelId: string, typeId: string): Promise<ChannelTypeDto> {
    return this.channelTypesApi.channelTypeEnable({ channelId, typeId, body: {
        enabled: true,
        requestedBy: ''
      } });
  }

  // Disable a channel type
  disable(channelId: string, typeId: string): Promise<ChannelTypeDto> {
    return this.channelTypesApi.channelTypeDisable({ channelId, typeId, body: {
        enabled: false,
        requestedBy: ''
      } });
  }

  // Start a lesson for the channel type
  startLesson(channelId: string, typeId: string, userId:string): Promise<SuccessDto> {
    console.log('Todo remove userId',userId);
    return this.channelTypesApi.channelTypeStartLesson({ channelId, typeId, body: {
        userId
      }
    });
  }

  // Quit a lesson for the channel type
  quitLesson(channelId: string, typeId: string, userId:string): Promise<SuccessDto> {
    console.log('Todo remove userId',userId);
    return this.channelTypesApi.channelTypeQuitLesson({ channelId, typeId,body:{
        userId
      }});
  }
}
