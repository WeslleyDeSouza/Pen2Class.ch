import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {OnEvent} from "@nestjs/event-emitter";

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  createdAt: Date;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private users: Map<string, User> = new Map();
  private usernameIndex: Map<string, string> = new Map(); // username -> userId

  createUser(username: string, email?: string, displayName?: string): User {
    // Check if username already exists
    if (this.usernameIndex.has(username.toLowerCase())) {
      throw new ConflictException(`Username ${username} is already taken`);
    }

    const user: User = {
      id: uuidv4(),
      username: username.toLowerCase(),
      email,
      displayName: displayName || username,
      createdAt: new Date()
    };

    this.users.set(user.id, user);
    this.usernameIndex.set(user.username, user.id);

    this.logger.log(`User created: ${user.username} (${user.id})`);

    return user;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      email: undefined // Don't expose emails in list
    }));
  }

  getUser(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user;
  }

  getUserByUsername(username: string): User | undefined {
    const userId = this.usernameIndex.get(username.toLowerCase());
    return userId ? this.users.get(userId) : undefined;
  }

  getUserChannels(userId: string) {
    // Verify user exists
    this.getUser(userId);

    // Return empty array for now - this will be handled by the channel controller
    return [];
  }

  @OnEvent('peer.disconnected')
  protected onPeerDisconnected({ peerId}: { peerId: string }){

  }
}
