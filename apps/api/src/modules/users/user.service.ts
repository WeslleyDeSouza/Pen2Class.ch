import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

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

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async createUser(username: string, email?: string, displayName?: string, type?: number): Promise<User> {
    const uname = username.toLowerCase();

    if (!type) {
      throw new ConflictException(`User Type is required for user ${username} `);
    }

    const existing = await this.userRepo.findOne({ where: { username: uname } });
    if (existing) throw new ConflictException(`Username ${username} is already taken`);

    const entity = this.userRepo.create({
      username: uname,
      email,
      displayName: displayName || username,
      type
    });
    const saved = await this.userRepo.save(entity);

    this.logger.log(`User created: ${saved.username} (${saved.id})`);

    return saved as unknown as User;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepo.find();
    return users.map((user) => ({
      ...user,
      email: undefined, // Don't expose emails in list
    } as unknown as User));
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user as unknown as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const uname = username.toLowerCase();
    const user = await this.userRepo.findOne({ where: { username: uname } });
    return user as unknown as User | undefined;
  }

  async getUserChannels(userId: string) {
    await this.getUser(userId); // Verify user exists
    return [];
  }

  @OnEvent('peer.disconnected')
  protected onPeerDisconnected({ peerId }: { peerId: string }) {
    // no-op for now
  }
}
