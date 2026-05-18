import { ConfigService } from '@nestjs/config';
import { validateProductionConfig } from '../../src/config/validate-production-config';

function config(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

describe('validateProductionConfig', () => {
  it('allows local development defaults outside production', () => {
    expect(() =>
      validateProductionConfig(
        config({
          NODE_ENV: 'development',
        }),
      ),
    ).not.toThrow();
  });

  it('rejects missing production credentials and secrets', () => {
    expect(() =>
      validateProductionConfig(
        config({
          NODE_ENV: 'production',
        }),
      ),
    ).toThrow('ADMIN_USERNAME is required in production');
  });

  it('rejects local development defaults in production', () => {
    expect(() =>
      validateProductionConfig(
        config({
          NODE_ENV: 'production',
          ADMIN_USERNAME: 'admin',
          ADMIN_PASSWORD: 'secure-password',
          JWT_SECRET: 'secure-secret',
        }),
      ),
    ).toThrow('ADMIN_USERNAME must not use a local development default in production');
  });

  it('allows secure production values', () => {
    expect(() =>
      validateProductionConfig(
        config({
          NODE_ENV: 'production',
          ADMIN_USERNAME: 'owner',
          ADMIN_PASSWORD: 'secure-password',
          JWT_SECRET: 'secure-secret',
        }),
      ),
    ).not.toThrow();
  });
});
