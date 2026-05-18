import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

describe('AuthService', () => {
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };
  let service: AuthService;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'admin',
        username: 'admin',
      }),
    };
    configService = {
      get: jest.fn((key: string, defaultValue: string) => {
        const values: Record<string, string> = {
          ADMIN_USERNAME: 'admin',
          ADMIN_PASSWORD: 'admin123',
          JWT_EXPIRES_IN: '8h',
        };

        return values[key] ?? defaultValue;
      }),
    };
    service = new AuthService(configService as never, jwtService as never);
  });

  it('returns a signed access token for valid admin credentials', async () => {
    await expect(service.login('admin', 'admin123')).resolves.toEqual({
      accessToken: 'signed-token',
      admin: {
        username: 'admin',
      },
      expiresIn: '8h',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'admin',
      username: 'admin',
    });
  });

  it('rejects invalid admin credentials', async () => {
    await expect(service.login('admin', 'wrong-password')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('verifies valid admin tokens', async () => {
    await expect(service.verifyToken('valid-token')).resolves.toEqual({
      sub: 'admin',
      username: 'admin',
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  it('rejects invalid or expired admin tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(service.verifyToken('expired-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
