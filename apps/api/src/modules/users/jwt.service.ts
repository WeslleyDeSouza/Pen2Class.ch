import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string; // user ID
  username: string;
  email?: string;
  type: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class UserJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user: { id: string; username: string; email?: string; type?: number }): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      type: user.type || 1
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'default-secret-key',
      expiresIn: '24h'
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET || 'default-secret-key'
    });
  }
}
