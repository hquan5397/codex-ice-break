import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';

type AdminPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    if (!this.hasValidCredentials(username, password)) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload: AdminPayload = {
      sub: 'admin',
      username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      admin: {
        username,
      },
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '8h'),
    };
  }

  async verifyToken(token: string): Promise<AdminPayload> {
    try {
      return await this.jwtService.verifyAsync<AdminPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }

  private hasValidCredentials(username: string, password: string): boolean {
    const configuredUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');
    const configuredPassword = this.configService.get<string>('ADMIN_PASSWORD', 'admin123');

    return this.safeEqual(username, configuredUsername) && this.safeEqual(password, configuredPassword);
  }

  private safeEqual(value: string, expected: string): boolean {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (valueBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(valueBuffer, expectedBuffer);
  }
}
