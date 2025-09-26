import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './user.entity';
import { UserSessionEntity } from './user-session.entity';

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
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepo: Repository<UserSessionEntity>,
  ) {}

  async createUser(username: string, password: string, email?: string, displayName?: string, type?: number): Promise<User> {
    const uname = username.toLowerCase();

    if (!type) {
      throw new ConflictException(`User Type is required for user ${username} `);
    }

    if (!password || password.trim().length === 0) {
      throw new ConflictException('Password cannot be empty');
    }

    const existing = await this.userRepo.findOne({ where: { username: uname } });
    if (existing) throw new ConflictException(`Username ${username} is already taken`);

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const entity = this.userRepo.create({
      username: uname,
      email,
      displayName: displayName || username,
      type,
      passwordHash
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

  async validateUser(username: string, password: string): Promise<User | null> {
    const uname = username.toLowerCase();
    const user = await this.userRepo.findOne({ where: { username: uname } });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user as unknown as User;
  }

  async createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<UserSessionEntity> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const session = this.sessionRepo.create({
      sessionToken,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: new Date()
    });

    return this.sessionRepo.save(session);
  }

  async validateSession(sessionToken: string): Promise<UserSessionEntity | null> {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken },
      relations: ['user']
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.sessionRepo.remove(session);
      }
      return null;
    }

    // Update last used time
    session.lastUsedAt = new Date();
    await this.sessionRepo.save(session);

    return session;
  }

  async revokeSession(sessionToken: string): Promise<void> {
    await this.sessionRepo.delete({ sessionToken });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepo.delete({ userId });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepo.delete({
      expiresAt: { $lt: new Date() } as any
    });
  }

  private generateSessionToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  @OnEvent('peer.disconnected')
  protected onPeerDisconnected({ peerId }: { peerId: string }) {
    // no-op for now
  }
}
