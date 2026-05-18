import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';

function createContext(authorization?: string) {
  const request = {
    headers: {
      authorization,
    },
  };

  return {
    request,
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext,
  };
}

describe('JwtAuthGuard', () => {
  let authService: {
    verifyToken: jest.Mock;
  };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    authService = {
      verifyToken: jest.fn().mockResolvedValue({
        sub: 'admin',
        username: 'admin',
      }),
    };
    guard = new JwtAuthGuard(authService as never);
  });

  it('allows requests with a valid bearer token', async () => {
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
    expect(request['admin']).toEqual({
      sub: 'admin',
      username: 'admin',
    });
  });

  it('rejects requests without a bearer token', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects requests with a non-bearer authorization header', async () => {
    const { context } = createContext('Basic abc123');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
